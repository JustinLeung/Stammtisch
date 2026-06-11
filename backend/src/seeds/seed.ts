/** Idempotent seeder: wipes and reloads venues + users.
 *
 * Usage:  npm run seed  (or `npm run seed:dev` for tsx)
 */
import { randomUUID } from 'node:crypto'
import { pathToFileURL } from 'node:url'

import { createDb, type Db, ensureSchema } from '../db.js'
import { utcnow } from '../models.js'
import { USERS } from './users.js'
import { VENUES } from './venues.js'

export async function seed(db: Db): Promise<{ venues: number; users: number }> {
  // order matters for FK integrity
  for (const table of ['votes', 'ratings', 'memberships', 'events', 'venues', 'users']) {
    await db.run(`DELETE FROM ${table}`)
  }

  const now = utcnow()
  for (const v of VENUES) {
    await db.run(
      `INSERT INTO venues (id, name, area, lat, lng, category, hours, price_band,
                           tags, accessibility, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [randomUUID(), v.name, v.area, v.lat, v.lng, v.category, JSON.stringify(v.hours),
       v.price_band, JSON.stringify(v.tags), JSON.stringify(v.accessibility), now, now],
    )
  }
  for (const u of USERS) {
    await db.run(
      `INSERT INTO users (id, display_name, interests, home_lat, home_lng,
                          travel_radius_km, availability_windows, budget_band,
                          constraints, verification_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [randomUUID(), u.display_name, JSON.stringify(u.interests), u.home_lat, u.home_lng,
       u.travel_radius_km, JSON.stringify(u.availability_windows), u.budget_band,
       JSON.stringify(u.constraints), u.verification_status, now, now],
    )
  }
  return { venues: VENUES.length, users: USERS.length }
}

async function main() {
  const db = createDb()
  await ensureSchema(db)
  const counts = await seed(db)
  await db.close()
  console.log(`Seeded ${counts.venues} venues, ${counts.users} users.`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
