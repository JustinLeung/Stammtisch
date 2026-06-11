import React from 'react'
import EventCard from '../components/EventCard.jsx'
import { isOpen } from '../engine.js'

export default function Home({ user, events, onToggleJoin, onReset }) {
  const mine = events.filter((e) => e.mine)
  const open = events.filter((e) => !e.mine && isOpen(e))

  return (
    <main className="shell shell--home">
      <header className="home-head">
        <span className="wordmark wordmark--sm">
          <span className="wordmark__dot" />
          STAMMTISCH
        </span>
        <div className="home-head__right">
          <span className="user-chip">
            <span className="user-chip__avatar">{user.name.charAt(0).toUpperCase()}</span>
            {user.name}{user.neighborhood ? ` · ${user.neighborhood}` : ''}
          </span>
          <button type="button" className="btn btn--ghost" onClick={onReset}>
            Reset demo
          </button>
        </div>
      </header>

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
            <EventCard key={e.id} event={e} onToggleJoin={onToggleJoin} delay={80 + i * 90} />
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
            <EventCard key={e.id} event={e} onToggleJoin={onToggleJoin} delay={160 + i * 90} />
          ))}
        </div>
      </section>

      <footer className="home-foot mono">
        STAMMTISCH · prototype · München first 🥨
      </footer>
    </main>
  )
}
