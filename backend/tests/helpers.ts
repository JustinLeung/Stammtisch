/** Shared test setup. Forces stub auth mode BEFORE the app modules load —
 * dotenv never overrides env vars that are already set, so a developer's
 * real Supabase credentials in backend/.env can't leak into the tests. */
process.env.SUPABASE_URL = ''
process.env.SUPABASE_PUBLISHABLE_KEY = ''
process.env.SUPABASE_ANON_KEY = ''

import type { AddressInfo } from 'node:net'

export const { createDb, ensureSchema } = await import('../src/db.js')
export const { createApp } = await import('../src/app.js')
export const { seed } = await import('../src/seeds/seed.js')

export interface TestServer {
  db: import('../src/db.js').Db
  base: string
  close(): Promise<void>
}

/** In-memory SQLite + the Express app on an ephemeral port. */
export async function makeServer(): Promise<TestServer> {
  const db = createDb('sqlite::memory:')
  await ensureSchema(db)
  const server = createApp(db).listen(0)
  const { port } = server.address() as AddressInfo
  return {
    db,
    base: `http://127.0.0.1:${port}`,
    close: async () => {
      server.close()
      await db.close()
    },
  }
}

export async function makeDb() {
  const db = createDb('sqlite::memory:')
  await ensureSchema(db)
  return db
}
