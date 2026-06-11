import React, { useEffect, useMemo, useState } from 'react'
import { INTERESTS } from '../data.js'

export default function Matching({ user, onDone }) {
  const messages = useMemo(() => {
    const first = INTERESTS.find((i) => i.id === user.interests[0])?.label ?? 'your interests'
    const firstSlot = (user.availability[0] ?? 'Thu-evening').replace('-', ' ')
    return [
      'Reading your interests…',
      `Scanning 1,284 Münchner profiles…`,
      `Strong overlap found: ${first.toLowerCase()} × ${firstSlot}s`,
      'Drafting events around your week…',
      'Reserving your seats…',
    ]
  }, [user])

  const [step, setStep] = useState(0)

  useEffect(() => {
    if (step >= messages.length) {
      const t = setTimeout(onDone, 500)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setStep((s) => s + 1), 950)
    return () => clearTimeout(t)
  }, [step, messages.length, onDone])

  return (
    <main className="shell shell--matching">
      <div className="pulse" aria-hidden="true">
        <span /><span /><span /><span />
      </div>
      <h1 className="display display--sm">Setting your table, {user.name}.</h1>
      <ul className="match-log mono">
        {messages.slice(0, step).map((m, i) => (
          <li key={i} className={i === step - 1 ? 'is-latest' : ''}>
            <span className="tick">✓</span> {m}
          </li>
        ))}
      </ul>
    </main>
  )
}
