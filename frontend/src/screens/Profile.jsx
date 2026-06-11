import React, { useState } from 'react'
import { NEIGHBORHOODS } from '../data.js'

export default function Profile({ onNext }) {
  const [name, setName] = useState('')
  const [hood, setHood] = useState('')

  const ready = name.trim().length > 0

  const submit = (e) => {
    e.preventDefault()
    if (!ready) return
    onNext(name.trim(), hood)
  }

  return (
    <main className="shell shell--step">
      <header className="step-head reveal" style={{ '--d': '0ms' }}>
        <span className="mono step-num">01 — WHO</span>
        <h1 className="display display--sm">Who's taking<br />the seat?</h1>
        <p className="lede">
          First name only — this is a table, not a conference. Your Viertel
          helps us keep your tables close to home.
        </p>
      </header>

      <form className="welcome-form reveal" style={{ '--d': '140ms' }} onSubmit={submit}>
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
      </form>

      <footer className="step-foot">
        <span />
        <button className="btn btn--primary" disabled={!ready} onClick={submit}>
          Next: what you love →
        </button>
      </footer>
    </main>
  )
}
