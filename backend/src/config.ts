/** Env-driven config. Loads backend/.env (gitignored). Auth provider
 * selection: Supabase when real credentials are present, stub otherwise —
 * the app always runs with zero external credentials (spec requirement). */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'

loadEnv({
  path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env'),
  quiet: true,
})

export const SUPABASE_URL = (process.env.SUPABASE_URL ?? '').trim()
// New-style publishable key preferred; legacy anon key accepted.
export const SUPABASE_KEY =
  (process.env.SUPABASE_PUBLISHABLE_KEY ?? '').trim() ||
  (process.env.SUPABASE_ANON_KEY ?? '').trim()
export const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173'

export function authMode(): 'supabase' | 'stub' {
  return SUPABASE_URL && SUPABASE_KEY ? 'supabase' : 'stub'
}
