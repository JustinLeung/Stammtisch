/** Core domain entities per spec §3. The DB stores JSON columns as TEXT and
 * timestamps as ISO-8601 TEXT (UTC) for SQLite/Postgres portability; the
 * `fromRow` mappers parse JSON back into objects.
 *
 * Datetimes are naive UTC throughout v1 (Europe/Berlin localization is a
 * frontend concern for now). */

// ---------- enums (stored as plain strings, matching the Python values) ----------

export type Intent = 'activity_friends' // extensible; v1 only value
export type BudgetBand = 'low' | 'mid' | 'high'
export type VerificationStatus = 'unverified' | 'verified'
export type SeedType = 'match' | 'ai' | 'host'
export type EventStatus =
  | 'seeded' | 'accepting' | 'deciding' | 'confirmed' | 'open_public'
  | 'roster_locked' | 'happening' | 'completed' | 'cancelled' | 'merged'
export type Visibility = 'private' | 'public'
export type MembershipRole = 'host' | 'joiner'
export type MembershipStatus = 'proposed' | 'accepted' | 'declined' | 'joined'

export const BAND_ORDER: Record<BudgetBand, number> = { low: 0, mid: 1, high: 2 }

/** Naive-UTC ISO timestamp (v1 convention, mirrors the old Python utcnow). */
export function utcnow(): string {
  return new Date().toISOString().replace('Z', '')
}

// ---------- entities ----------

// [{dow: 0-6 (Mon=0), start: "14:00", end: "20:00"}, ...]
export interface AvailabilityWindow {
  dow: number
  start: string
  end: string
}

export interface User {
  id: string
  display_name: string
  // real-account identity (null for seeded/synthetic users)
  email: string | null
  auth_id: string | null
  interests: string[] // freeform tags
  intent: Intent
  home_lat: number
  home_lng: number
  travel_radius_km: number
  availability_windows: AvailabilityWindow[]
  budget_band: BudgetBand
  // {dietary: [...], accessibility: [...], alcohol_ok: bool, setting: "indoor"|"outdoor"|"either"}
  constraints: Record<string, unknown>
  verification_status: VerificationStatus
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Venue {
  id: string
  name: string
  area: string // neighborhood bucket
  lat: number
  lng: number
  category: string
  // {"mon": ["09:00","23:00"], ...}; missing/null day = closed; close < open = past midnight
  hours: Record<string, [string, string] | null>
  price_band: BudgetBand
  tags: string[]
  // {wheelchair: bool, step_free: bool}
  accessibility: Record<string, boolean>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// ---------- row mappers (parse TEXT-encoded JSON columns) ----------

function json<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback
  if (typeof value === 'string') return JSON.parse(value) as T
  return value as T
}

export function userFromRow(row: Record<string, unknown>): User {
  return {
    ...row,
    interests: json(row.interests, []),
    availability_windows: json(row.availability_windows, []),
    constraints: json(row.constraints, {}),
  } as unknown as User
}

export function venueFromRow(row: Record<string, unknown>): Venue {
  return {
    ...row,
    hours: json(row.hours, {}),
    tags: json(row.tags, []),
    accessibility: json(row.accessibility, {}),
  } as unknown as Venue
}
