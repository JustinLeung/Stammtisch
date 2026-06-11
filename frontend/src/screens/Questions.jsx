import React, { useState } from 'react'
import { QUESTIONS } from '../data.js'

const MAX = 3

const draw = (exclude) => {
  const unused = QUESTIONS.filter((q) => !exclude.includes(q))
  return unused[Math.floor(Math.random() * unused.length)]
}

export default function Questions({ onNext }) {
  // one card to start; the user opts into more
  const [cards, setCards] = useState(() => [{ q: draw([]), a: '' }])

  const setAnswer = (i, a) =>
    setCards((c) => c.map((x, j) => (j === i ? { ...x, a } : x)))

  // Swap one question for a random unused one and clear its answer
  const reroll = (i) =>
    setCards((c) =>
      c.map((x, j) => (j === i ? { q: draw(c.map((y) => y.q)), a: '' } : x)),
    )

  const addCard = () =>
    setCards((c) => [...c, { q: draw(c.map((x) => x.q)), a: '' }])

  const answered = cards.filter((c) => c.a.trim())

  const submit = () =>
    onNext(answered.map(({ q, a }) => ({ q, a: a.trim() })))

  return (
    <main className="shell shell--step">
      <header className="step-head reveal" style={{ '--d': '0ms' }}>
        <span className="mono step-num">04 — YOU</span>
        <h1 className="display display--sm">Your Tischkarte.</h1>
        <p className="lede">
          One question to break the ice. Your answer becomes the place card
          your tablemates see before you sit down — so skip the CV, keep it
          human. Answer more if you're enjoying it, or head straight to your
          seat. Don't like the question? Deal a new one.
        </p>
      </header>

      <div className="q-stack">
        {cards.map(({ q, a }, i) => (
          <div className="q-card reveal" style={{ '--d': `${140 + i * 110}ms` }} key={q}>
            <div className="q-card__top">
              <span className="mono q-card__num">Q{i + 1}</span>
              <p className="q-card__question">{q}</p>
              <button
                type="button"
                className="q-card__reroll"
                onClick={() => reroll(i)}
                title="Deal me a different question"
                aria-label={`Replace question ${i + 1}`}
              >
                ↻
              </button>
            </div>
            <textarea
              className="q-card__answer"
              autoFocus={i === cards.length - 1}
              value={a}
              onChange={(e) => setAnswer(i, e.target.value)}
              placeholder="One honest sentence is plenty…"
              rows={2}
              maxLength={160}
            />
            <span className="mono q-card__chars">{a.length}/160</span>
          </div>
        ))}

        {cards.length < MAX && (
          <button
            type="button"
            className="q-add reveal"
            style={{ '--d': `${140 + cards.length * 110}ms` }}
            onClick={addCard}
          >
            + Deal me another question
          </button>
        )}
      </div>

      <footer className="step-foot">
        <span className="mono count">
          {answered.length} answered · all optional
        </span>
        <button className="btn btn--primary" onClick={submit}>
          {answered.length > 0 ? 'Seat me →' : 'Skip — seat me →'}
        </button>
      </footer>
    </main>
  )
}
