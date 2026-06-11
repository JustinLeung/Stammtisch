import React, { useEffect, useState } from 'react'
import { DAYS, SLOTS } from '../data.js'

const key = (day, slot) => `${day}-${slot}`

const PRESETS = [
  { label: 'Evenings', keys: DAYS.map((d) => key(d, 'evening')) },
  { label: 'Weekends', keys: ['Sat', 'Sun'].flatMap((d) => SLOTS.map((s) => key(d, s.id))) },
  { label: 'After work', keys: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d) => key(d, 'evening')) },
]

export default function Availability({ onNext }) {
  const [on, setOn] = useState(new Set())
  const [paint, setPaint] = useState(null) // null | 'add' | 'remove'

  useEffect(() => {
    const stop = () => setPaint(null)
    window.addEventListener('pointerup', stop)
    return () => window.removeEventListener('pointerup', stop)
  }, [])

  const setCell = (k, mode) =>
    setOn((prev) => {
      const next = new Set(prev)
      mode === 'add' ? next.add(k) : next.delete(k)
      return next
    })

  const startPaint = (k) => {
    const mode = on.has(k) ? 'remove' : 'add'
    setPaint(mode)
    setCell(k, mode)
  }

  const applyPreset = (keys) =>
    setOn((prev) => {
      const allOn = keys.every((k) => prev.has(k))
      const next = new Set(prev)
      keys.forEach((k) => (allOn ? next.delete(k) : next.add(k)))
      return next
    })

  return (
    <main className="shell shell--step">
      <header className="step-head reveal" style={{ '--d': '0ms' }}>
        <span className="mono step-num">03 — WHEN</span>
        <h1 className="display display--sm">When can München<br />count on you?</h1>
        <p className="lede">
          Tap or drag across the week. Tables only get suggested for times
          you've actually marked free.
        </p>
      </header>

      <div className="presets reveal" style={{ '--d': '120ms' }}>
        {PRESETS.map((p) => (
          <button key={p.label} type="button" className="preset" onClick={() => applyPreset(p.keys)}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="week reveal" style={{ '--d': '200ms' }}>
        <div className="week__corner" />
        {DAYS.map((d) => (
          <div key={d} className="week__day mono">{d}</div>
        ))}
        {SLOTS.map((slot) => (
          <React.Fragment key={slot.id}>
            <div className="week__slot mono">{slot.label}</div>
            {DAYS.map((d) => {
              const k = key(d, slot.id)
              const active = on.has(k)
              return (
                <button
                  key={k}
                  type="button"
                  className={`cell ${active ? 'is-on' : ''}`}
                  onPointerDown={(e) => { e.preventDefault(); startPaint(k) }}
                  onPointerEnter={() => paint && setCell(k, paint)}
                  aria-pressed={active}
                  aria-label={`${d} ${slot.label}`}
                />
              )
            })}
          </React.Fragment>
        ))}
      </div>

      <footer className="step-foot">
        <span className="mono count">{on.size} slots free</span>
        <button
          className="btn btn--primary"
          disabled={on.size === 0}
          onClick={() => onNext([...on])}
        >
          Next: three questions →
        </button>
      </footer>
    </main>
  )
}
