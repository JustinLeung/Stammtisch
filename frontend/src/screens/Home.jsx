import React, { useEffect, useState } from 'react'
import EventCard from '../components/EventCard.jsx'
import ProfileModal from '../components/ProfileModal.jsx'
import { isOpen } from '../engine.js'
import { PROFILES } from '../data.js'
import { getAuthConfig, sendMagicLink } from '../api.js'

/**
 * Shown to demo (guest) users: upgrade to a real account in place, without
 * losing the tables they've already joined. Hidden once signed in, or when
 * the backend is unreachable (nothing to offer then).
 */
function AccountBanner({ onAuthed }) {
  const [cfg, setCfg] = useState(undefined)
  const [email, setEmail] = useState('')
  const [phase, setPhase] = useState('idle') // idle | sending | sent
  const [error, setError] = useState('')

  useEffect(() => {
    getAuthConfig().then(setCfg).catch(() => setCfg(null))
  }, [])

  if (!cfg) return null // loading or backend down — demo carries on

  const submit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setError('')
    setPhase('sending')
    try {
      const res = await sendMagicLink(email.trim())
      if (res.token) {
        // stub mode: signed in instantly
        onAuthed(res.token, email.trim())
      } else {
        setPhase('sent')
      }
    } catch (err) {
      setError(err.message)
      setPhase('idle')
    }
  }

  if (phase === 'sent') {
    return (
      <aside className="demo-banner reveal" style={{ '--d': '0ms' }}>
        <p className="demo-banner__copy">
          ✉️ Check your inbox — the magic link in <strong>{email}</strong> lands
          you right back at this table, signed in.
        </p>
      </aside>
    )
  }

  return (
    <aside className="demo-banner reveal" style={{ '--d': '0ms' }}>
      <p className="demo-banner__copy">
        <span className="badge badge--forming">DEMO</span>
        You're browsing as a guest — these tables are simulated. Create an
        account to keep your seat.
      </p>
      <form className="demo-banner__form" onSubmit={submit}>
        <input
          className="field__input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label="Email"
        />
        <button
          className="btn btn--primary btn--sm"
          type="submit"
          disabled={!email.trim() || phase === 'sending'}
        >
          {phase === 'sending' ? 'Sending…' : 'Create account →'}
        </button>
      </form>
      {error && <p className="auth-error">{error}</p>}
    </aside>
  )
}

/**
 * Shown to signed-in users: their account is real, but the tables aren't yet.
 * Keeps expectations honest until live matching replaces the simulation.
 */
function SimulatedBanner() {
  return (
    <aside className="demo-banner demo-banner--simulated reveal" style={{ '--d': '0ms' }}>
      <p className="demo-banner__copy">
        <span className="badge badge--forming">SIMULATED</span>
        Your account is real — these tables aren't yet. Everything below is a
        simulation while we wire up live matching, so joining a table doesn't
        commit you to anything (yet).
      </p>
    </aside>
  )
}

export default function Home({ user, events, onToggleJoin, onReset, auth, onAuthed, onAbout }) {
  const mine = events.filter((e) => e.mine)
  const open = events.filter((e) => !e.mine && isOpen(e))
  const [profileName, setProfileName] = useState(null)

  const profile =
    profileName === 'You'
      ? {
          name: user.name || 'You',
          neighborhood: user.neighborhood,
          answers: user.answers ?? [],
          isYou: true,
        }
      : profileName
        ? { name: profileName, ...PROFILES[profileName] }
        : null

  return (
    <main className="shell shell--home">
      <header className="home-head">
        <span className="wordmark wordmark--sm">
          <span className="wordmark__dot" />
          STAMMTISCH
        </span>
        <div className="home-head__right">
          {auth?.email && <span className="auth-chip mono" title="Signed in">✓ {auth.email}</span>}
          <button
            type="button"
            className="user-chip user-chip--clickable"
            title="View your Tischkarte"
            onClick={() => setProfileName('You')}
          >
            <span className="user-chip__avatar">{user.name.charAt(0).toUpperCase()}</span>
            {user.name}{user.neighborhood ? ` · ${user.neighborhood}` : ''}
          </button>
          <button type="button" className="btn btn--ghost" onClick={onReset}>
            {auth ? 'Sign out & reset' : 'Reset demo'}
          </button>
        </div>
      </header>

      {auth ? <SimulatedBanner /> : <AccountBanner onAuthed={onAuthed} />}

      {user.answers?.length > 0 && (
        <aside className="tischkarte reveal" style={{ '--d': '0ms' }}>
          <div className="tischkarte__head">
            <span className="mono">Your Tischkarte</span>
            <span className="tischkarte__name">
              {user.name}{user.neighborhood ? ` · ${user.neighborhood}` : ''}
            </span>
          </div>
          <p className="tischkarte__hint">What your tablemates see before you sit down:</p>
          <dl className="tischkarte__qa">
            {user.answers.map(({ q, a }) => (
              <div key={q}>
                <dt>{q}</dt>
                <dd>“{a}”</dd>
              </div>
            ))}
          </dl>
        </aside>
      )}

      <section className="feed-section">
        <div className="section-head reveal" style={{ '--d': '0ms' }}>
          <h2 className="display display--xs">Your tables</h2>
          <p className="lede lede--sm">
            Drafted by AI from your interests and your week. Confirm a seat —
            when more than 3 people are in, the table opens to all of München.
          </p>
        </div>
        <div className="card-grid">
          {mine.map((e, i) => (
            <EventCard key={e.id} event={e} onToggleJoin={onToggleJoin} onViewProfile={setProfileName} delay={80 + i * 90} />
          ))}
        </div>
      </section>

      <section className="feed-section">
        <div className="section-head reveal" style={{ '--d': '120ms' }}>
          <h2 className="display display--xs">Open in München</h2>
          <p className="lede lede--sm">
            Tables that already hit critical mass. Anyone can grab a seat.
          </p>
        </div>
        <div className="card-grid">
          {open.map((e, i) => (
            <EventCard key={e.id} event={e} onToggleJoin={onToggleJoin} onViewProfile={setProfileName} delay={160 + i * 90} />
          ))}
        </div>
      </section>

      <footer className="home-foot mono">
        STAMMTISCH · prototype · München first 🥨 ·{' '}
        <button type="button" className="home-foot__link" onClick={onAbout}>
          About
        </button>
      </footer>

      <ProfileModal person={profile} onClose={() => setProfileName(null)} />
    </main>
  )
}
