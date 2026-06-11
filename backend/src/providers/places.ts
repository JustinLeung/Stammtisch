/** PlacesProvider seam (spec §3/§9). One seeded implementation for v1;
 * a future GooglePlacesProvider implements the same interface. */
import type { Db } from '../db.js'
import { BAND_ORDER, type BudgetBand, type Venue, venueFromRow } from '../models.js'

export const DOW_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

/** True if the venue is open at `when`. close < open means past-midnight
 * closing (e.g. 19:00–01:00). */
export function isOpenAt(venue: Venue, when: Date): boolean {
  // JS getDay() is Sun=0; DOW_KEYS is Mon=0 like Python's weekday()
  const day = (venue.hours ?? {})[DOW_KEYS[(when.getDay() + 6) % 7]]
  if (!day) return false
  const [openT, closeT] = day
  const t = `${String(when.getHours()).padStart(2, '0')}:${String(when.getMinutes()).padStart(2, '0')}`
  if (closeT < openT) return t >= openT || t < closeT // spills past midnight
  return openT <= t && t < closeT
}

export interface VenueSearch {
  area?: string
  categories?: string[]
  openAt?: Date
  maxPrice?: BudgetBand
  tagsAny?: string[]
}

export interface PlacesProvider {
  get(venueId: string): Promise<Venue | null>
  search(filters?: VenueSearch): Promise<Venue[]>
}

/** Backed by the seeded `venues` table — no external key needed. */
export class SeededPlacesProvider implements PlacesProvider {
  constructor(private db: Db) {}

  async get(venueId: string): Promise<Venue | null> {
    const rows = await this.db.query(
      'SELECT * FROM venues WHERE id = ? AND deleted_at IS NULL',
      [venueId],
    )
    return rows[0] ? venueFromRow(rows[0]) : null
  }

  async search(filters: VenueSearch = {}): Promise<Venue[]> {
    let sql = 'SELECT * FROM venues WHERE deleted_at IS NULL'
    const params: unknown[] = []
    if (filters.area) {
      sql += ' AND area = ?'
      params.push(filters.area)
    }
    if (filters.categories?.length) {
      sql += ` AND category IN (${filters.categories.map(() => '?').join(', ')})`
      params.push(...filters.categories)
    }
    let venues = (await this.db.query(sql, params)).map(venueFromRow)

    if (filters.openAt) venues = venues.filter((v) => isOpenAt(v, filters.openAt!))
    if (filters.maxPrice) {
      venues = venues.filter((v) => BAND_ORDER[v.price_band] <= BAND_ORDER[filters.maxPrice!])
    }
    if (filters.tagsAny?.length) {
      const wanted = new Set(filters.tagsAny)
      venues = venues.filter((v) => (v.tags ?? []).some((t) => wanted.has(t)))
    }
    return venues
  }
}
