import React, { useState } from 'react'
import { QUESTIONS } from '../data.js'

const COUNT = 3

const drawThree = () =>
  [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, COUNT)

export default function Questions({ onNext }) {
  const [questions, setQuestions] = useState(drawThree)
  const [answers, setAnswers] = useState(Array(COUNT).fill(''))

  const setAnswer = (i, value) =>
    setAnswers((a) => a.map((x, j) => (j === i ? value : x)))

  // Swap one question for a random unused one and clear its answer
  const reroll = (i) => {
    const unused = QUESTIONS.filter((q) => !questions.includes(q))
    const next = unused[Math.floor(Math.random() * unused.length)]
    setQuestions((qs) => qs.map((q, j) => (j === i ? next : q)))
    setAnswer(i, '')
  }

  const done = answers.every((a) => a.trim().length > 0)

  const submit = () => {
    if (!done) return
    onNext(questions.map((q, i) => ({ q, a: answers[i].trim() })))
  }

  return (
    <main className="shell shell--step">
      <header className="step-head reveal" style={{ '--d': '0ms' }}>
        <span className="mono step-num">04 — YOU</span>
        <h1 className="display display--sm">Your Tischkarte.</h1>
        <p className="lede">
          Three questions, drawn at random. Your answers become the place card
          your tablemates see before you sit down — so skip the CV, keep it
          human. Don’t like a question? Deal a new one.
        </p>
      </header>

      <div className="q-stack">
        {questions.map((q, i) => (
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
              value={answers[i]}
              onChange={(e) => setAnswer(i, e.target.value)}
              placeholder="One honest sentence is plenty…"
              rows={2}
              maxLength={160}
            />
            <span className="mono q-card__chars">{answers[i].length}/160</span>
          </div>
        ))}
      </div>

      <footer className="step-foot">
        <span className="mono count">
          {answers.filter((a) => a.trim()).length} / {COUNT} answered
        </span>
        <button className="btn btn--primary" disabled={!done} onClick={submit}>
          Seat me →
        </button>
      </footer>
    </main>
  )
}
