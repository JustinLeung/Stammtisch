import React, { useEffect, useState } from 'react'
import { NEIGHBORHOODS } from '../data.js'
import { getAuthConfig, sendMagicLink } from '../api.js'

function Sunburst() {
  // Aicher-style concentric arcs
  const rings = [44, 37, 30, 23, 16]
  const colors = ['var(--blue)', 'var(--green)', 'var(--orange)', 'var(--yellow)', 'var(--red)']
  return (
    <svg className="sunburst" viewBox="0 0 100 100" aria-hidden="true">
      {rings.map((r, i) => (
        <circle
          key={r}
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={colors[i]}
          strokeWidth="4.5"
          strokeDasharray={`${r * 4.4} ${r * 2.2}`}
          strokeLinecap="round"
          style={{ animationDuration: `${26 + i * 9}s`, animationDirection: i % 2 ? 'reverse' : 'normal' }}
        />
      ))}
    </svg>
  )
}

/**
 * Landing: one hero, two doors. "Try the demo" walks straight into the
 * simulated experience with no account; "Create an account" goes through
 * magic link / Google first. Both land in the same onboarding.
 */
export default function Welcome({ onNext, onAuthed, authedEmail }) {
  const [phase, setPhase] = useState('landing') // landing | form | sending | sent
  const [path, setPath] = useState(null) // 'demo' | 'account'
  const [name, setName] = useState('')
  const [hood, setHood] = useState('')
  const [email, setEmail] = useState('')
  const [cfg, setCfg] = useState(undefined) // undefined = loading, null = backend unreachable
  const [error, setError] = useState('')

  useEffect(() => {
    getAuthConfig().then(setCfg).catch(() => setCfg(null))
  }, [])

  const offline = cfg === null
  const needsEmail = path === 'account' && !authedEmail && !offline
  const ready = name.trim() && (!needsEmail || email.trim())

  const choose = (nextPath) => {
    setPath(nextPath)
    setError('')
    setPhase('form')
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!ready) return
    setError('')

    // demo path, already signed in, or backend down: straight to onboarding
    if (path === 'demo' || authedEmail || offline) {
      onNext(name.trim(), hood)
      return
    }

    setPhase('sending')
    try {
      const res = await sendMagicLink(email.trim())
      if (res.token) {
        // stub mode: the "emailed link" logs in instantly
        onAuthed(res.token, email.trim())
        onNext(name.trim(), hood)
      } else {
        // real mode: park the profile draft for when they return
        sessionStorage.setItem('stammtisch_pending', JSON.stringify({ name: name.trim(), hood }))
        setPhase('sent')
      }
    } catch (err) {
      setError(err.message)
      setPhase('form')
    }
  }

  if (phase === 'sent') {
    return (
      <main className="shell shell--welcome">
        <Sunburst />
        <header className="wordmark reveal" style={{ '--d': '0ms' }}>
          <span className="wordmark__dot" />
          STAMMTISCH
        </header>
        <div className="welcome-hero">
          <p className="eyebrow reveal" style={{ '--d': '60ms' }}>One more step</p>
          <h1 className="display reveal" style={{ '--d': '140ms' }}>
            Check your<br /><em>inbox.</em>
          </h1>
          <p className="lede reveal" style={{ '--d': '240ms' }}>
            We sent a magic link to <strong>{email}</strong>. Click it and
            you'll land right back here, signed in — no password, ever.
          </p>
          <button
            className="btn btn--ghost reveal"
            style={{ '--d': '320ms' }}
            onClick={() => setPhase('form')}
          >
            ← Use a different email
          </button>
        </div>
        <footer className="welcome-foot" />
      </main>
    )
  }

  return (
    <main className="shell shell--welcome">
      <Sunburst />
      <header className="wordmark reveal" style={{ '--d': '0ms' }}>
        <span className="wordmark__dot" />
        STAMMTISCH
      </header>

      <div className="welcome-hero">
        <p className="eyebrow reveal" style={{ '--d': '80ms' }}>München · launching first here</p>
        <h1 className="display reveal" style={{ '--d': '160ms' }}>
          Strangers,<br />
          <em>seated.</em>
        </h1>
        <p className="lede reveal" style={{ '--d': '260ms' }}>
          Tell us what you love and when you're free. Our AI drafts the event
          and seats you at a table of people like you. When more than three
          confirm, the table opens to the whole city.
        </p>

        {phase === 'landing' ? (
          <div className="welcome-cta reveal" style={{ '--d': '360ms' }}>
            <button className="btn btn--primary" onClick={() => choose('demo')}>
              Try the demo →
            </button>
            <button className="btn" onClick={() => choose('account')} disabled={offline}>
              {authedEmail ? `Continue as ${authedEmail} →` : 'Create an account'}
            </button>
            <p className="welcome-cta__hint mono">
              {offline
                ? 'API OFFLINE — ACCOUNTS UNAVAILABLE, THE DEMO STILL WORKS'
                : 'DEMO: SIMULATED TABLES, NO SIGN-UP · ACCOUNT: MAGIC LINK OR GOOGLE, NO PASSWORD'}
            </p>
          </div>
        ) : (
          <form className="welcome-form reveal" style={{ '--d': '80ms' }} onSubmit={submit}>
            <label className="field">
              <span className="field__label">First name</span>
              <input
                autoFocus
                className="field__input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Servus, I'm…"
                maxLength={24}
              />
            </label>
            <label className="field">
              <span className="field__label">Your Viertel <small>(optional)</small></span>
              <select className="field__input" value={hood} onChange={(e) => setHood(e.target.value)}>
                <option value="">Pick a neighborhood</option>
                {NEIGHBORHOODS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>

            {path === 'demo' ? (
              <p className="auth-note auth-note--offline">
                Demo mode — simulated tables, nothing leaves your browser. You
                can create an account later without losing your seat.
              </p>
            ) : authedEmail ? (
              <p className="auth-note">✓ Signed in as <strong>{authedEmail}</strong></p>
            ) : offline ? (
              <p className="auth-note auth-note--offline">API offline — continuing as local demo</p>
            ) : (
              <label className="field field--wide">
                <span className="field__label">Email</span>
                <input
                  className="field__input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </label>
            )}

            <div className="auth-actions">
              <button className="btn btn--primary" type="submit" disabled={!ready || phase === 'sending'}>
                {!needsEmail
                  ? 'Take a seat →'
                  : phase === 'sending' ? 'Sending…' : 'Email me a magic link →'}
              </button>
              {needsEmail && cfg?.google_auth_url && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => { window.location.href = cfg.google_auth_url }}
                >
                  Continue with Google
                </button>
              )}
              <button type="button" className="btn btn--ghost" onClick={() => setPhase('landing')}>
                ← Back
              </button>
            </div>
            {error && <p className="auth-error">{error}</p>}
          </form>
        )}
      </div>

      <footer className="welcome-foot reveal" style={{ '--d': '460ms' }}>
        <span className="mono">01 — WHO</span>
        <span className="mono">02 — WHAT</span>
        <span className="mono">03 — WHEN</span>
        <span className="mono">04 — YOU</span>
      </footer>
    </main>
  )
}
