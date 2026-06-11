/** Database setup. SQLite by default so the app runs with zero external
 * credentials; set DATABASE_URL (e.g. postgresql://...) to use Postgres.
 * Raw SQL throughout: `?` placeholders, translated to $n for Postgres.
 * The schema avoids dialect-specific types so the swap is config-only
 * (JSON columns are TEXT, timestamps are ISO-8601 TEXT). */
import Database from 'better-sqlite3'
import pg from 'pg'

export interface Db {
  readonly dialect: 'sqlite' | 'postgres'
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>
  run(sql: string, params?: unknown[]): Promise<void>
  close(): Promise<void>
}

class SqliteDb implements Db {
  readonly dialect = 'sqlite' as const
  private db: Database.Database

  constructor(file: string) {
    this.db = new Database(file)
    this.db.pragma('foreign_keys = ON')
  }

  async query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    return this.db.prepare(sql).all(...params) as T[]
  }

  async run(sql: string, params: unknown[] = []): Promise<void> {
    this.db.prepare(sql).run(...params)
  }

  async close(): Promise<void> {
    this.db.close()
  }
}

class PostgresDb implements Db {
  readonly dialect = 'postgres' as const
  private pool: pg.Pool

  constructor(url: string) {
    this.pool = new pg.Pool({ connectionString: url })
  }

  private toPg(sql: string): string {
    let i = 0
    return sql.replace(/\?/g, () => `$${++i}`)
  }

  async query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    const { rows } = await this.pool.query(this.toPg(sql), params)
    return rows as T[]
  }

  async run(sql: string, params: unknown[] = []): Promise<void> {
    await this.pool.query(this.toPg(sql), params)
  }

  async close(): Promise<void> {
    await this.pool.end()
  }
}

export function createDb(url = process.env.DATABASE_URL ?? ''): Db {
  if (url.startsWith('postgres')) return new PostgresDb(url)
  const file = url.startsWith('sqlite:')
    ? url.replace(/^sqlite:(\/\/)?/, '') || ':memory:'
    : './stammtisch.db'
  return new SqliteDb(file === ':memory:' ? ':memory:' : file)
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    email TEXT UNIQUE,
    auth_id TEXT UNIQUE,
    interests TEXT NOT NULL DEFAULT '[]',
    intent TEXT NOT NULL DEFAULT 'activity_friends',
    home_lat REAL NOT NULL,
    home_lng REAL NOT NULL,
    travel_radius_km REAL NOT NULL DEFAULT 5,
    availability_windows TEXT NOT NULL DEFAULT '[]',
    budget_band TEXT NOT NULL DEFAULT 'mid',
    constraints TEXT NOT NULL DEFAULT '{}',
    verification_status TEXT NOT NULL DEFAULT 'unverified',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS venues (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    area TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    category TEXT NOT NULL,
    hours TEXT NOT NULL DEFAULT '{}',
    price_band TEXT NOT NULL DEFAULT 'mid',
    tags TEXT NOT NULL DEFAULT '[]',
    accessibility TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS idx_venues_area ON venues (area)`,
  `CREATE INDEX IF NOT EXISTS idx_venues_category ON venues (category)`,
  `CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    seed_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'seeded',
    theme TEXT NOT NULL,
    area TEXT NOT NULL,
    time_window TEXT NOT NULL DEFAULT '{}',
    scheduled_time TEXT,
    venue_id TEXT REFERENCES venues (id),
    shortlist TEXT NOT NULL DEFAULT '[]',
    min_size INTEGER NOT NULL DEFAULT 3,
    max_size INTEGER NOT NULL DEFAULT 5,
    threshold INTEGER NOT NULL DEFAULT 3,
    decision_deadline TEXT,
    lock_time TEXT,
    visibility TEXT NOT NULL DEFAULT 'private',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS idx_events_status ON events (status)`,
  `CREATE INDEX IF NOT EXISTS idx_events_area ON events (area)`,
  `CREATE TABLE IF NOT EXISTS memberships (
    user_id TEXT NOT NULL REFERENCES users (id),
    event_id TEXT NOT NULL REFERENCES events (id),
    role TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'proposed',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    PRIMARY KEY (user_id, event_id)
  )`,
  `CREATE TABLE IF NOT EXISTS votes (
    event_id TEXT NOT NULL REFERENCES events (id),
    user_id TEXT NOT NULL REFERENCES users (id),
    venue_id TEXT NOT NULL REFERENCES venues (id),
    created_at TEXT NOT NULL,
    PRIMARY KEY (event_id, user_id)
  )`,
  `CREATE TABLE IF NOT EXISTS ratings (
    event_id TEXT NOT NULL REFERENCES events (id),
    user_id TEXT NOT NULL REFERENCES users (id),
    score INTEGER NOT NULL,
    comment TEXT,
    created_at TEXT NOT NULL,
    PRIMARY KEY (event_id, user_id)
  )`,
]

export async function ensureSchema(db: Db): Promise<void> {
  for (const stmt of SCHEMA) await db.run(stmt)
}
