import assert from 'node:assert/strict'
import { before, describe, it } from 'node:test'

import { makeDb, seed } from './helpers.js'
import type { Db } from '../src/db.js'

const { SeededPlacesProvider, isOpenAt } = await import('../src/providers/places.js')
const { userFromRow, venueFromRow } = await import('../src/models.js')

const HHMM = /^\d{2}:\d{2}$/

let db: Db
before(async () => {
  db = await makeDb()
  await seed(db)
})

const allVenues = async () => (await db.query('SELECT * FROM venues')).map(venueFromRow)

// ---------- seed integrity ----------

describe('seed integrity', () => {
  it('seeds >= 50 venues across multiple areas', async () => {
    const venues = await allVenues()
    assert.ok(venues.length >= 50)
    const areas = new Set(venues.map((v) => v.area))
    assert.ok(areas.size >= 2) // "a couple of neighborhoods" per spec
  })

  it('every venue has well-formed hours', async () => {
    for (const v of await allVenues()) {
      assert.ok(Object.keys(v.hours).length, `${v.name} has no hours`)
      for (const [day, span] of Object.entries(v.hours)) {
        assert.ok(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].includes(day))
        if (span !== null) {
          const [openT, closeT] = span
          assert.ok(HHMM.test(openT) && HHMM.test(closeT), v.name)
        }
      }
    }
  })

  it('seeds >= 20 valid users including an unverified edge case', async () => {
    const users = (await db.query('SELECT * FROM users')).map(userFromRow)
    assert.ok(users.length >= 20)
    for (const u of users) {
      assert.ok(u.interests.length, u.display_name)
      assert.ok(u.travel_radius_km > 0)
      for (const w of u.availability_windows) {
        assert.ok(w.dow >= 0 && w.dow <= 6)
        assert.ok(w.start < w.end)
      }
    }
    // at least one unverified edge case for the fit-gate tests later
    assert.ok(users.some((u) => u.verification_status === 'unverified'))
  })

  it('seeding is idempotent', async () => {
    const before = (await allVenues()).length
    await seed(db) // run again
    const after = (await allVenues()).length
    assert.equal(before, after)
  })
})

// ---------- places provider ----------

function thursdayAt(hhmm: string): Date {
  // 2026-06-18 is a Thursday
  const [h, m] = hhmm.split(':').map(Number)
  return new Date(2026, 5, 18, h, m)
}

describe('places provider', () => {
  it('search by area', async () => {
    const places = new SeededPlacesProvider(db)
    const result = await places.search({ area: 'Haidhausen' })
    assert.ok(result.length)
    assert.ok(result.every((v) => v.area === 'Haidhausen'))
  })

  it('openAt filters closed venues (museums closed Mondays)', async () => {
    const places = new SeededPlacesProvider(db)
    const mondayNoon = new Date(2026, 5, 15, 12, 0)
    const openMonday = await places.search({ area: 'Maxvorstadt', openAt: mondayNoon })
    assert.ok(openMonday.every((v) => v.category !== 'museum'))
    const thursdayNoon = new Date(2026, 5, 18, 12, 0)
    const openThursday = await places.search({ area: 'Maxvorstadt', openAt: thursdayNoon })
    assert.ok(openThursday.some((v) => v.category === 'museum'))
  })

  it('handles past-midnight closing', async () => {
    // Café Puck closes 01:00: open at 00:30, closed at 02:00
    const [row] = await db.query('SELECT * FROM venues WHERE name = ?', ['Café Puck'])
    const venue = venueFromRow(row)
    assert.ok(isOpenAt(venue, thursdayAt('00:30')))
    assert.ok(!isOpenAt(venue, thursdayAt('02:00')))
    assert.ok(isOpenAt(venue, thursdayAt('23:00')))
  })

  it('price and tag filters', async () => {
    const places = new SeededPlacesProvider(db)
    const cheap = await places.search({ maxPrice: 'low' })
    assert.ok(cheap.length)
    assert.ok(cheap.every((v) => v.price_band === 'low'))
    const outdoor = await places.search({ tagsAny: ['outdoor'] })
    assert.ok(outdoor.length)
    assert.ok(outdoor.every((v) => v.tags.includes('outdoor')))
  })

  it('get returns null for missing venues', async () => {
    const places = new SeededPlacesProvider(db)
    assert.equal(await places.get('nope'), null)
  })
})

// ---------- schema constraints ----------

describe('schema constraints', () => {
  it('one vote and one rating per (event, user)', async () => {
    const now = new Date().toISOString()
    await db.run(
      `INSERT INTO users (id, display_name, home_lat, home_lng, created_at, updated_at)
       VALUES ('u1', 'Test', 48.13, 11.58, ?, ?)`, [now, now],
    )
    await db.run(
      `INSERT INTO events (id, seed_type, theme, area, created_at, updated_at)
       VALUES ('e1', 'match', 'board games', 'Maxvorstadt', ?, ?)`, [now, now],
    )
    const [venue] = await db.query<{ id: string }>('SELECT id FROM venues LIMIT 1')

    await db.run(
      `INSERT INTO votes (event_id, user_id, venue_id, created_at) VALUES ('e1', 'u1', ?, ?)`,
      [venue.id, now],
    )
    await db.run(
      `INSERT INTO ratings (event_id, user_id, score, comment, created_at)
       VALUES ('e1', 'u1', 5, 'Great table', ?)`, [now],
    )
    // composite PKs: a second vote for the same (event, user) is rejected
    await assert.rejects(
      db.run(
        `INSERT INTO votes (event_id, user_id, venue_id, created_at) VALUES ('e1', 'u1', ?, ?)`,
        [venue.id, now],
      ),
    )
  })
})
