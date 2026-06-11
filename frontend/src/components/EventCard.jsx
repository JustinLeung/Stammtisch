import React from 'react'
import { INTERESTS, THRESHOLD } from '../data.js'
import { isOpen, seatsToOpen, slotTime } from '../engine.js'

export default function EventCard({ event, onToggleJoin, delay = 0 }) {
  const interest = INTERESTS.find((i) => i.id === event.interestId)
  const color = interest?.color ?? 'blue'
  const open = isOpen(event)
  const joined = event.confirmed.includes('You')
  const full = !joined && event.confirmed.length >= event.capacity
  const missing = seatsToOpen(event)

  return (
    <article
      className={`card card--${color} ${open ? 'is-open' : 'is-forming'} reveal`}
      style={{ '--d': `${delay}ms` }}
    >
      <div className="card__top">
        <span className={`badge badge--${open ? 'open' : 'forming'}`}>
          {open ? 'OPEN TO ALL' : 'FORMING'}
        </span>
        <span className="mono card__when">
          {event.day} · {slotTime(event.slot)}
        </span>
      </div>

      <h3 className="card__title">{event.title}</h3>
      <p className="card__venue">
        {event.venue} <span className="card__area">— {event.area}</span>
      </p>

      {event.why && <p className="card__why">✦ {event.why}</p>}

      <div className="seats" aria-label={`${event.confirmed.length} of ${event.capacity} seats confirmed`}>
        {Array.from({ length: event.capacity }).map((_, i) => {
          const person = event.confirmed[i]
          const isYou = person === 'You'
          return (
            <React.Fragment key={i}>
              <span
                className={`seat ${person ? 'is-filled' : ''} ${isYou ? 'is-you' : ''}`}
                title={person ?? 'Empty seat'}
              >
                {person ? person.charAt(0) : ''}
              </span>
              {i === THRESHOLD - 1 && i < event.capacity - 1 && (
                <span className="seats__gate mono" title="Opens to everyone past this seat">⟶</span>
              )}
            </React.Fragment>
          )
        })}
      </div>

      <div className="card__bottom">
        <span className="card__status mono">
          {open
            ? `${event.confirmed.length}/${event.capacity} seated`
            : `${missing} more to open`}
        </span>
        <button
          type="button"
          className={`btn ${joined ? 'btn--joined' : 'btn--primary'} btn--sm`}
          onClick={() => onToggleJoin(event.id)}
          disabled={full}
        >
          {joined ? '✓ You’re in' : full ? 'Table full' : 'Confirm seat'}
        </button>
      </div>
    </article>
  )
}
