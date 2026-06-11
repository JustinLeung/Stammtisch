import React, { useState } from 'react'
import { NEIGHBORHOODS } from '../data.js'

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

export default function Welcome({ onNext }) {
  const [name, setName] = useState('')
  const [hood, setHood] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (name.trim()) onNext(name.trim(), hood)
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

        <form className="welcome-form reveal" style={{ '--d': '360ms' }} onSubmit={submit}>
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
          <button className="btn btn--primary" type="submit" disabled={!name.trim()}>
            Take a seat →
          </button>
        </form>
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
