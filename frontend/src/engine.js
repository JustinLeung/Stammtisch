import { TEMPLATES, OPEN_SEED, PEOPLE, SLOTS, THRESHOLD } from './data.js'

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

let idCounter = 1
const nextId = () => `evt-${idCounter++}-${Math.random().toString(36).slice(2, 7)}`

export function slotTime(slotId) {
  return SLOTS.find((s) => s.id === slotId)?.time ?? '19:00'
}

function samplePeople(n, exclude = []) {
  return shuffle(PEOPLE.filter((p) => !exclude.includes(p))).slice(0, n)
}

/**
 * The mock "AI": turns the user's interests + availability into table
 * suggestions. Each suggestion lands on a slot the user actually marked
 * free, and gets seeded with a few already-confirmed Münchner.
 * The first table starts one seat short of critical mass so the demo
 * can show an unlock the moment the user confirms.
 */
export function generateTables(user) {
  const availability = [...user.availability] // ["Thu-evening", ...]
  if (availability.length === 0) return []

  const interests = shuffle(user.interests).slice(0, 4)
  const slots = shuffle(availability)
  const seedSizes = [THRESHOLD - 1, 2, 1, 2] // 3, 2, 1, 2 confirmed

  return interests.map((interestId, i) => {
    const template = pick(TEMPLATES[interestId] ?? [{ title: 'Meetup', venue: 'TBD', area: 'München' }])
    const [day, slot] = (slots[i % slots.length]).split('-')
    const confirmed = samplePeople(seedSizes[i] ?? 2)
    return {
      id: nextId(),
      interestId,
      title: template.title,
      venue: template.venue,
      area: template.area,
      day,
      slot,
      confirmed,
      capacity: 6 + Math.floor(Math.random() * 3),
      mine: true,
      why: `You + ${confirmed.length + 3 + Math.floor(Math.random() * 9)} nearby picked this interest and overlap on ${day} ${slot}s.`,
    }
  })
}

export function seedOpenEvents() {
  return OPEN_SEED.map((e) => ({ ...e, id: nextId(), interestId: e.interest, mine: false }))
}

export const isOpen = (evt) => evt.confirmed.length >= THRESHOLD
export const seatsToOpen = (evt) => Math.max(0, THRESHOLD - evt.confirmed.length)

/** One tick of the demo simulation: a random not-full table gains a Münchner. */
export function simulateJoin(events) {
  const candidates = events.filter((e) => e.confirmed.length < e.capacity)
  if (candidates.length === 0) return { events, joined: null }
  const target = pick(candidates)
  const [person] = samplePeople(1, target.confirmed)
  if (!person) return { events, joined: null }
  const updated = events.map((e) =>
    e.id === target.id ? { ...e, confirmed: [...e.confirmed, person] } : e,
  )
  return { events: updated, joined: { eventId: target.id, person } }
}
