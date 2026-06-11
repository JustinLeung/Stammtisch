/** Auth endpoints. Two login paths, both producing the same bearer token:
 *
 * - magic link (primary): POST /auth/magic-link → email lands the user back
 *   on the frontend with tokens in the URL fragment (stub mode: instant token)
 * - email+password: POST /auth/signup | /auth/login (kept for tests/scripts)
 *
 * (Google OAuth is disabled for now — /auth/config no longer advertises it.)
 *
 * The backend stores no passwords; it only verifies bearer tokens via the
 * AuthProvider and maps them to local Users.
 *
 * Errors use FastAPI's `{detail: ...}` shape — the frontend depends on it.
 */
import { randomUUID } from 'node:crypto'

import { Router, type Request } from 'express'

import * as config from '../config.js'
import type { Db } from '../db.js'
import { type User, userFromRow, utcnow } from '../models.js'
import { AuthError, type AuthIdentity, type AuthProvider } from '../providers/auth.js'

const MUNICH_CENTER = [48.137, 11.575] as const

function parseEmail(value: unknown): string {
  if (typeof value !== 'string') throw new AuthError(422, 'invalid email')
  const email = value.trim().toLowerCase()
  const domain = email.split('@').at(-1) ?? ''
  if (!email.includes('@') || !domain.includes('.')) throw new AuthError(422, 'invalid email')
  return email
}

function parsePassword(value: unknown): string {
  if (typeof value !== 'string') throw new AuthError(422, 'invalid password')
  return value
}

async function ensureUser(db: Db, ident: AuthIdentity, displayName?: string | null): Promise<User> {
  const byAuthId = await db.query('SELECT * FROM users WHERE auth_id = ?', [ident.authId])
  if (byAuthId[0]) return userFromRow(byAuthId[0])

  const byEmail = await db.query('SELECT * FROM users WHERE email = ?', [ident.email])
  if (byEmail[0]) {
    // seeded/pre-linked user claiming their account
    await db.run('UPDATE users SET auth_id = ?, updated_at = ? WHERE id = ?', [
      ident.authId, utcnow(), byEmail[0].id,
    ])
    return userFromRow({ ...byEmail[0], auth_id: ident.authId })
  }

  const now = utcnow()
  const user: Partial<User> & { id: string } = {
    id: randomUUID(),
    display_name: displayName || ident.email.split('@')[0],
    email: ident.email,
    auth_id: ident.authId,
    home_lat: MUNICH_CENTER[0],
    home_lng: MUNICH_CENTER[1],
    // real account ⇒ verified for v1 (stub verification per spec)
    verification_status: 'verified',
  }
  await db.run(
    `INSERT INTO users (id, display_name, email, auth_id, home_lat, home_lng,
                        verification_status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [user.id, user.display_name, user.email, user.auth_id, user.home_lat,
     user.home_lng, user.verification_status, now, now],
  )
  const rows = await db.query('SELECT * FROM users WHERE id = ?', [user.id])
  return userFromRow(rows[0])
}

function userPayload(user: User, token?: string | null, needsConfirmation = false) {
  const out: Record<string, unknown> = {
    user: {
      id: user.id,
      display_name: user.display_name,
      email: user.email,
      verification_status: user.verification_status,
    },
    needs_confirmation: needsConfirmation,
  }
  if (token) out.token = token
  return out
}

async function currentUser(req: Request, db: Db, provider: AuthProvider): Promise<User> {
  const authorization = req.headers.authorization
  if (!authorization?.startsWith('Bearer ')) throw new AuthError(401, 'Missing bearer token')
  const ident = await provider.verify(authorization.slice('Bearer '.length))
  return ensureUser(db, ident)
}

export function authRouter(db: Db, provider: AuthProvider): Router {
  const router = Router()

  router.get('/config', (_req, res) => {
    res.json({ mode: config.authMode(), magic_link: true, google_auth_url: null })
  })

  router.post('/magic-link', async (req, res) => {
    const email = parseEmail(req.body?.email)
    const result = await provider.sendMagicLink(email, config.FRONTEND_ORIGIN)
    if (result === null) {
      res.json({ sent: true })
      return
    }
    const user = await ensureUser(db, result.identity)
    res.json({ sent: true, ...userPayload(user, result.token) })
  })

  router.post('/signup', async (req, res) => {
    const email = parseEmail(req.body?.email)
    const password = parsePassword(req.body?.password)
    const result = await provider.signup(email, password)
    const user = await ensureUser(db, result.identity, req.body?.display_name)
    res.json(userPayload(user, result.token, result.token === null))
  })

  router.post('/login', async (req, res) => {
    const email = parseEmail(req.body?.email)
    const password = parsePassword(req.body?.password)
    const result = await provider.login(email, password)
    const user = await ensureUser(db, result.identity)
    res.json(userPayload(user, result.token))
  })

  router.get('/me', async (req, res) => {
    const user = await currentUser(req, db, provider)
    res.json(userPayload(user))
  })

  return router
}
