import React, { useState } from 'react'
import { INTERESTS } from '../data.js'

const MIN = 3

export default function Interests({ onNext }) {
  const [picked, setPicked] = useState([])

  const toggle = (id) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  return (
    <main className="shell shell--step">
      <header className="step-head reveal" style={{ '--d': '0ms' }}>
        <span className="mono step-num">02 — WHAT</span>
        <h1 className="display display--sm">What pulls you<br />out the door?</h1>
        <p className="lede">
          Pick at least {MIN}. This is how the AI decides who sits with you —
          the more honest, the better the table.
        </p>
      </header>

      <div className="chip-cloud reveal" style={{ '--d': '140ms' }}>
        {INTERESTS.map((it, i) => (
          <button
            key={it.id}
            type="button"
            className={`chip chip--${it.color} ${picked.includes(it.id) ? 'is-on' : ''}`}
            style={{ '--d': `${140 + i * 22}ms` }}
            onClick={() => toggle(it.id)}
            aria-pressed={picked.includes(it.id)}
          >
            {it.label}
          </button>
        ))}
      </div>

      <footer className="step-foot">
        <span className="mono count">
          {picked.length} / {MIN}+ picked
        </span>
        <button
          className="btn btn--primary"
          disabled={picked.length < MIN}
          onClick={() => onNext(picked)}
        >
          {picked.length < MIN ? `Pick ${MIN - picked.length} more` : 'Next: when you’re free →'}
        </button>
      </footer>
    </main>
  )
}
