import assert from 'node:assert/strict'
import { after, before, beforeEach, describe, it } from 'node:test'

import { makeServer, type TestServer } from './helpers.js'

const { AuthError, StubAuthProvider, SupabaseAuthProvider } = await import(
  '../src/providers/auth.js'
)

// ---------- stub flow end-to-end (default mode, no credentials) ----------

describe('stub auth flow', () => {
  let srv: TestServer
  before(async () => { srv = await makeServer() })
  after(async () => { await srv.close() })
  beforeEach(async () => { await srv.db.run('DELETE FROM users') })

  const post = (path: string, body: unknown) =>
    fetch(`${srv.base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

  it('config reports stub mode', async () => {
    const cfg = await (await fetch(`${srv.base}/auth/config`)).json()
    assert.equal(cfg.mode, 'stub')
    assert.equal(cfg.magic_link, true)
    assert.equal(cfg.google_auth_url, null)
  })

  it('magic link logs in instantly', async () => {
    const resp = await post('/auth/magic-link', { email: 'anna@example.com' })
    assert.equal(resp.status, 200)
    const data = await resp.json()
    assert.equal(data.sent, true)
    assert.ok(data.token.startsWith('stub:'))
    // local user created, verified, named from email prefix
    const [user] = await srv.db.query<Record<string, string>>(
      'SELECT * FROM users WHERE email = ?', ['anna@example.com'],
    )
    assert.equal(user.display_name, 'anna')
    assert.equal(user.verification_status, 'verified')
  })

  it('me roundtrip keeps a stable identity', async () => {
    const { token } = await (await post('/auth/magic-link', { email: 'max@example.com' })).json()
    const me = (t: string) =>
      fetch(`${srv.base}/auth/me`, { headers: { Authorization: `Bearer ${t}` } })
    const me1 = await (await me(token)).json()
    const me2 = await (await me(token)).json()
    assert.equal(me1.user.id, me2.user.id) // same local user on re-auth
  })

  it('signup/login password path', async () => {
    const up = await (await post('/auth/signup', {
      email: 'vroni@example.com', password: 'pw', display_name: 'Vroni',
    })).json()
    assert.equal(up.user.display_name, 'Vroni')
    const down = await (await post('/auth/login', {
      email: 'vroni@example.com', password: 'pw',
    })).json()
    assert.equal(down.user.id, up.user.id)
  })

  it('rejects bad or missing tokens', async () => {
    const bad = await fetch(`${srv.base}/auth/me`, {
      headers: { Authorization: 'Bearer nonsense' },
    })
    assert.equal(bad.status, 401)
    const missing = await fetch(`${srv.base}/auth/me`)
    assert.equal(missing.status, 401)
  })

  it('rejects invalid emails with 422 and a detail message', async () => {
    const resp = await post('/auth/magic-link', { email: 'not-an-email' })
    assert.equal(resp.status, 422)
    const data = await resp.json()
    assert.ok(data.detail) // frontend reads errors from `detail`
  })
})

// ---------- supabase provider against a mocked GoTrue ----------

function mockGotrue(input: string | URL | Request, init?: RequestInit): Promise<Response> {
  const url = new URL(String(input))
  const headers = (init?.headers ?? {}) as Record<string, string>
  assert.equal(headers.apikey, 'test-key')
  const json = (status: number, body: unknown) =>
    Promise.resolve(new Response(JSON.stringify(body), { status }))

  if (url.pathname.endsWith('/signup')) {
    return json(200, {
      user: { id: 'sb-uuid-1', email: 'lena@example.com' },
      access_token: 'jwt-abc',
    })
  }
  if (url.pathname.endsWith('/token')) {
    return json(200, {
      access_token: 'jwt-abc',
      user: { id: 'sb-uuid-1', email: 'lena@example.com' },
    })
  }
  if (url.pathname.endsWith('/user')) {
    if (headers.Authorization === 'Bearer jwt-abc') {
      return json(200, { id: 'sb-uuid-1', email: 'lena@example.com' })
    }
    return json(401, { msg: 'invalid JWT' })
  }
  if (url.pathname.endsWith('/otp')) {
    assert.ok(url.searchParams.get('redirect_to'))
    return json(200, {})
  }
  return json(404, {})
}

describe('supabase provider (mocked GoTrue)', () => {
  const provider = new SupabaseAuthProvider('https://proj.supabase.co', 'test-key', mockGotrue)

  it('signup and login return identity and token', async () => {
    const up = await provider.signup('lena@example.com', 'pw123456')
    assert.equal(up.identity.authId, 'sb-uuid-1')
    assert.equal(up.token, 'jwt-abc')
    const down = await provider.login('lena@example.com', 'pw123456')
    assert.equal(down.token, 'jwt-abc')
  })

  it('verify resolves valid tokens and rejects bad ones with 401', async () => {
    const ident = await provider.verify('jwt-abc')
    assert.equal(ident.email, 'lena@example.com')
    await assert.rejects(provider.verify('wrong'), (e: InstanceType<typeof AuthError>) => {
      assert.equal(e.statusCode, 401)
      return true
    })
  })

  it('magic link sends an email and returns null', async () => {
    const result = await provider.sendMagicLink('lena@example.com', 'http://localhost:5173')
    assert.equal(result, null)
  })
})

// ---------- stub provider determinism ----------

describe('stub provider', () => {
  it('identity is deterministic and case-insensitive', async () => {
    const p = new StubAuthProvider()
    const a = (await p.sendMagicLink('Same@Example.com'))!.identity
    const b = await p.verify('stub:same@example.com')
    assert.equal(a.authId, b.authId)
  })
})
