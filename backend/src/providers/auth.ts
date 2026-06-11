/** AuthProvider seam (spec §9: auth is externally swappable).
 *
 * - StubAuthProvider: default; deterministic fake accounts, no network.
 * - SupabaseAuthProvider: real email/password accounts against Supabase
 *   GoTrue REST (/auth/v1). Uses only the publishable/anon key — never the
 *   service_role key — so it is safe in any environment.
 */
import { createHash } from 'node:crypto'

import * as config from '../config.js'

export interface AuthIdentity {
  authId: string
  email: string
}

export interface AuthSession {
  identity: AuthIdentity
  token: string | null // null => signup ok but email confirmation pending
}

export class AuthError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message)
  }
}

export interface AuthProvider {
  signup(email: string, password: string): Promise<AuthSession>
  login(email: string, password: string): Promise<AuthSession>
  verify(token: string): Promise<AuthIdentity>
  /** Passwordless login. Returns an AuthSession when login completes
   * immediately (stub mode); returns null when a real email was sent and
   * the session arrives later via the redirect link. */
  sendMagicLink(email: string, redirectTo?: string): Promise<AuthSession | null>
}

// ---------------------------------------------------------------- stub

const STUB_NS = 'a5b1c3d0-0000-4000-8000-000000000000'

/** RFC 4122 uuid5 (SHA-1, namespaced) — same algorithm as Python's
 * uuid.uuid5, so stub auth_ids stay stable across the rewrite. */
function uuid5(name: string, namespace: string): string {
  const ns = Buffer.from(namespace.replace(/-/g, ''), 'hex')
  const bytes = createHash('sha1')
    .update(Buffer.concat([ns, Buffer.from(name, 'utf8')]))
    .digest()
    .subarray(0, 16)
  bytes[6] = (bytes[6] & 0x0f) | 0x50 // version 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80 // RFC 4122 variant
  const hex = bytes.toString('hex')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

/** Fake accounts: any email/password works, token is `stub:<email>`.
 * auth_id is deterministic per email so re-login maps to the same user. */
export class StubAuthProvider implements AuthProvider {
  private identity(email: string): AuthIdentity {
    const lower = email.toLowerCase()
    return { authId: uuid5(lower, STUB_NS), email: lower }
  }

  async signup(email: string, _password: string): Promise<AuthSession> {
    const identity = this.identity(email)
    return { identity, token: `stub:${identity.email}` }
  }

  async login(email: string, password: string): Promise<AuthSession> {
    return this.signup(email, password)
  }

  async verify(token: string): Promise<AuthIdentity> {
    if (!token.startsWith('stub:')) throw new AuthError(401, 'Invalid token')
    return this.identity(token.slice('stub:'.length))
  }

  async sendMagicLink(email: string): Promise<AuthSession | null> {
    return this.signup(email, '') // stub: the "emailed link" logs in instantly
  }
}

// ------------------------------------------------------------ supabase

type FetchLike = typeof fetch

export class SupabaseAuthProvider implements AuthProvider {
  private base: string

  constructor(
    url: string,
    private key: string,
    private fetchImpl: FetchLike = fetch,
  ) {
    this.base = `${url.replace(/\/+$/, '')}/auth/v1`
  }

  private async request(
    method: string,
    path: string,
    opts: { json?: unknown; params?: Record<string, string>; token?: string } = {},
  ): Promise<Response> {
    const url = new URL(`${this.base}${path}`)
    for (const [k, v] of Object.entries(opts.params ?? {})) url.searchParams.set(k, v)
    const headers: Record<string, string> = { apikey: this.key }
    if (opts.json !== undefined) headers['Content-Type'] = 'application/json'
    if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`
    return this.fetchImpl(url, {
      method,
      headers,
      body: opts.json !== undefined ? JSON.stringify(opts.json) : undefined,
      signal: AbortSignal.timeout(10_000),
    })
  }

  private async raise(resp: Response): Promise<never> {
    const text = await resp.text()
    let msg = text
    try {
      const body = JSON.parse(text)
      msg = body.msg || body.error_description || body.message || text
    } catch {
      /* not JSON; keep raw text */
    }
    throw new AuthError([400, 401, 403].includes(resp.status) ? 401 : 502, msg)
  }

  async signup(email: string, password: string): Promise<AuthSession> {
    const resp = await this.request('POST', '/signup', { json: { email, password } })
    if (resp.status >= 400) await this.raise(resp)
    const data = await resp.json()
    const user = data.user ?? data // shape differs with/without auto-confirm
    return {
      identity: { authId: user.id, email: user.email },
      token: data.access_token ?? null,
    }
  }

  async login(email: string, password: string): Promise<AuthSession> {
    const resp = await this.request('POST', '/token', {
      params: { grant_type: 'password' },
      json: { email, password },
    })
    if (resp.status >= 400) await this.raise(resp)
    const data = await resp.json()
    return {
      identity: { authId: data.user.id, email: data.user.email },
      token: data.access_token,
    }
  }

  async verify(token: string): Promise<AuthIdentity> {
    const resp = await this.request('GET', '/user', { token })
    if (resp.status >= 400) await this.raise(resp)
    const user = await resp.json()
    return { authId: user.id, email: user.email }
  }

  async sendMagicLink(email: string, redirectTo?: string): Promise<AuthSession | null> {
    const resp = await this.request('POST', '/otp', {
      params: redirectTo ? { redirect_to: redirectTo } : {},
      json: { email, create_user: true },
    })
    if (resp.status >= 400) await this.raise(resp)
    return null // email sent; session arrives via the redirect link
  }
}

// ------------------------------------------------------------- factory

export function getAuthProvider(): AuthProvider {
  if (config.authMode() === 'supabase') {
    return new SupabaseAuthProvider(config.SUPABASE_URL, config.SUPABASE_KEY)
  }
  return new StubAuthProvider()
}
