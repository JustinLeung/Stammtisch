import React from 'react'

const REPO_URL = 'https://github.com/JustinLeung/Stammtisch'

/** Aicher-style arcs, sunk into the bottom corner like a setting sun. */
function CornerArcs() {
  const rings = [44, 36, 28, 20, 12]
  const colors = ['var(--blue)', 'var(--green)', 'var(--orange)', 'var(--yellow)', 'var(--red)']
  return (
    <svg className="about-arcs" viewBox="0 0 100 50" aria-hidden="true">
      {rings.map((r, i) => (
        <circle key={r} cx="50" cy="50" r={r} fill="none" stroke={colors[i]} strokeWidth="4.5" />
      ))}
    </svg>
  )
}

const STORY = [
  {
    num: '01',
    tone: 'blue',
    title: 'The hard part was never the wanting',
    body: 'Everyone wants to be more social. What kills the plan is the activation energy: picking the right activity, finding people who are free when you are, and grinding through the details until something actually lands on a calendar. Most plans die right there.',
  },
  {
    num: '02',
    tone: 'green',
    title: 'So we made that part automatic',
    body: 'Here you\'re matched with people who share your interests and your free hours — no searching, no group-chat polls. A handful of suggested events is generated straight from what you have in common, so the "what should we even do?" question answers itself.',
  },
  {
    num: '03',
    tone: 'orange',
    title: 'The first to commit become the hosts',
    body: 'When the first people say yes, the table becomes theirs. Hosts gain ownership of the event — their names on it, their say in the details — so every table has someone genuinely invested in it actually happening.',
  },
  {
    num: '04',
    tone: 'red',
    title: 'Don\'t want to host? Don\'t.',
    body: 'Plenty of tables have already hit critical mass — enough people committed that the event is on, no matter what. Find one, grab a seat, and just show up. Someone else already did the hard part.',
  },
]

export default function About({ onBack }) {
  return (
    <main className="shell shell--about">
      <CornerArcs />

      <header className="about-top">
        <span className="wordmark wordmark--sm">
          <span className="wordmark__dot" />
          STAMMTISCH
        </span>
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          ← Back
        </button>
      </header>

      <div className="about-hero">
        <p className="eyebrow reveal" style={{ '--d': '60ms' }}>About · born at a hackathon</p>
        <h1 className="display display--sm reveal" style={{ '--d': '140ms' }}>
          Being social shouldn't take <em>a project plan.</em>
        </h1>
        <p className="lede reveal" style={{ '--d': '240ms' }}>
          Stammtisch started as a hackathon idea with one goal: help people
          be more social. Not by inventing new friends — by removing the
          logistics that stand between wanting to go out and actually going.
        </p>
      </div>

      <ol className="about-story">
        {STORY.map(({ num, tone, title, body }, i) => (
          <li key={num} className={`about-card about-card--${tone} reveal`} style={{ '--d': `${320 + i * 90}ms` }}>
            <span className="about-card__num mono">{num}</span>
            <h2 className="about-card__title">{title}</h2>
            <p className="about-card__body">{body}</p>
          </li>
        ))}
      </ol>

      <aside className="about-fork reveal" style={{ '--d': '700ms' }}>
        <div className="about-fork__copy">
          <p className="mono about-fork__eyebrow">Open source · MIT-spirited</p>
          <h2 className="display display--xs">Built in one evening, left on the table.</h2>
          <p>
            The whole thing — the matching demo, the Express API, this very
            page — is on GitHub. Fork it, gut it, bring the Stammtisch to
            your own city. The seat next to us is free.
          </p>
        </div>
        <a className="btn btn--invert" href={REPO_URL} target="_blank" rel="noreferrer">
          Fork it on GitHub ↗
        </a>
      </aside>

      <footer className="home-foot mono">
        STAMMTISCH · prototype · München first 🥨
      </footer>
    </main>
  )
}
