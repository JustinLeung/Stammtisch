import React, { useEffect } from 'react'

const COLORS = ['blue', 'green', 'orange', 'red']
const colorFor = (name) =>
  COLORS[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % COLORS.length]

/**
 * Tischkarte overlay for any person at a table. Shows only what tablemates
 * may see: name, neighborhood, and their 3 icebreaker answers — never email.
 */
export default function ProfileModal({ person, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!person) return null
  const color = colorFor(person.name)

  return (
    <div className="profile-overlay" onClick={onClose} role="presentation">
      <article
        className={`profile profile--${color}`}
        role="dialog"
        aria-modal="true"
        aria-label={`${person.name}’s Tischkarte`}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="profile__close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <header className="profile__head">
          <span className="profile__avatar">{person.name.charAt(0).toUpperCase()}</span>
          <div>
            <h3 className="profile__name">
              {person.name}
              {person.isYou && <span className="profile__you mono"> · you</span>}
            </h3>
            {person.neighborhood && <p className="profile__hood mono">{person.neighborhood}</p>}
          </div>
        </header>

        {person.answers?.length > 0 ? (
          <dl className="tischkarte__qa">
            {person.answers.map(({ q, a }) => (
              <div key={q}>
                <dt>{q}</dt>
                <dd>“{a}”</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="profile__empty">No Tischkarte yet — they kept it mysterious.</p>
        )}
      </article>
    </div>
  )
}
