import React, { useCallback, useEffect, useRef, useState } from 'react'
import Welcome from './screens/Welcome.jsx'
import Profile from './screens/Profile.jsx'
import Interests from './screens/Interests.jsx'
import Availability from './screens/Availability.jsx'
import Questions from './screens/Questions.jsx'
import Matching from './screens/Matching.jsx'
import Home from './screens/Home.jsx'
import About from './screens/About.jsx'
import { generateTables, seedOpenEvents, simulateJoin } from './engine.js'
import { THRESHOLD } from './data.js'
import { captureRedirectToken, fetchMe } from './api.js'

const STORAGE_KEY = 'stammtisch_v1'
const AUTH_KEY = 'stammtisch_auth'

function loadAuth() {
  // tokens from a magic-link / Google redirect take priority over stored ones
  const redirected = captureRedirectToken()
  if (redirected) {
    const auth = { token: redirected, email: null }
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth))
    return auth
  }
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY)) ?? null
  } catch {
    return null
  }
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data?.user || !data?.events) return null
    return data
  } catch {
    return null
  }
}

export default function App() {
  const saved = useRef(loadSaved()).current

  const [screen, setScreen] = useState(() =>
    window.location.pathname === '/about' ? 'about' : saved ? 'home' : 'welcome',
  )
  // where "← Back" from the About page should land
  const beforeAbout = useRef(saved ? 'home' : 'welcome')
  const [user, setUser] = useState(
    saved?.user ?? { name: '', neighborhood: '', interests: [], availability: [] },
  )
  const [events, setEvents] = useState(saved?.events ?? [])
  const [toasts, setToasts] = useState([])
  const [auth, setAuth] = useState(() => loadAuth())

  // resolve email for tokens that arrived via redirect (and resume the
  // onboarding that was interrupted by the magic link)
  useEffect(() => {
    if (!auth?.token || auth.email) return
    fetchMe(auth.token)
      .then((res) => {
        const next = { token: auth.token, email: res.user.email }
        localStorage.setItem(AUTH_KEY, JSON.stringify(next))
        setAuth(next)
        addToast(`Signed in as ${res.user.email}`, 'info')
        if (sessionStorage.getItem('stammtisch_pending') && screen === 'welcome') {
          sessionStorage.removeItem('stammtisch_pending')
          setScreen('profile')
        }
      })
      .catch(() => {
        localStorage.removeItem(AUTH_KEY)  // stale/expired token
        setAuth(null)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth])

  const handleAuthed = (token, email) => {
    const next = { token, email }
    localStorage.setItem(AUTH_KEY, JSON.stringify(next))
    setAuth(next)
    if (email) addToast(`Signed in as ${email}`, 'info')
  }

  // ---------- toasts ----------
  const toastId = useRef(0)
  const addToast = useCallback((text, tone = 'info') => {
    const id = ++toastId.current
    setToasts((t) => [...t, { id, text, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5200)
  }, [])

  // ---------- persistence ----------
  useEffect(() => {
    if (screen === 'home') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, events }))
    }
  }, [screen, user, events])

  const resetDemo = () => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(AUTH_KEY)
    setAuth(null)
    setUser({ name: '', neighborhood: '', interests: [], availability: [] })
    setEvents([])
    setToasts([])
    setScreen('welcome')
  }

  // ---------- about page (the only screen with its own URL) ----------
  const openAbout = () => {
    beforeAbout.current = screen
    window.history.pushState({}, '', '/about')
    setScreen('about')
  }
  const closeAbout = () => {
    window.history.pushState({}, '', '/')
    setScreen(beforeAbout.current)
  }
  useEffect(() => {
    const onPop = () => {
      setScreen((cur) => {
        if (window.location.pathname === '/about') return 'about'
        return cur === 'about' ? beforeAbout.current : cur
      })
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // ---------- onboarding transitions ----------
  const finishWelcome = () => setScreen('profile')
  const finishProfile = (name, neighborhood) => {
    setUser((u) => ({ ...u, name, neighborhood }))
    setScreen('interests')
  }
  const finishInterests = (interests) => {
    setUser((u) => ({ ...u, interests }))
    setScreen('availability')
  }
  const finishAvailability = (availability) => {
    setUser((u) => ({ ...u, availability }))
    setScreen('questions')
  }
  const finishQuestions = (answers) => {
    const fullUser = { ...user, answers }
    setUser(fullUser)
    setEvents([...generateTables(fullUser), ...seedOpenEvents()])
    setScreen('matching')
  }
  const finishMatching = () => setScreen('home')

  // ---------- joining / leaving ----------
  const toggleJoin = (eventId) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== eventId) return e
        const joined = e.confirmed.includes('You')
        if (joined) return { ...e, confirmed: e.confirmed.filter((p) => p !== 'You') }
        if (e.confirmed.length >= e.capacity) return e
        const confirmed = [...e.confirmed, 'You']
        if (e.confirmed.length < THRESHOLD && confirmed.length >= THRESHOLD) {
          setTimeout(
            () => addToast(`“${e.title}” hit critical mass — it's now open to all of München! 🍻`, 'unlock'),
            350,
          )
        }
        return { ...e, confirmed }
      }),
    )
  }

  // ---------- live demo simulation: Münchner keep joining ----------
  useEffect(() => {
    if (screen !== 'home') return
    const tick = setInterval(() => {
      setEvents((prev) => {
        if (Math.random() < 0.35) return prev
        const { events: next, joined } = simulateJoin(prev)
        if (joined) {
          const before = prev.find((e) => e.id === joined.eventId)
          const after = next.find((e) => e.id === joined.eventId)
          const crossed = before.confirmed.length < THRESHOLD && after.confirmed.length >= THRESHOLD
          const youAreIn = after.confirmed.includes('You')
          if (crossed && youAreIn) {
            setTimeout(() => addToast(`“${after.title}” hit critical mass — it's now open to all of München! 🍻`, 'unlock'), 0)
          } else if (youAreIn || after.mine) {
            setTimeout(() => addToast(`${joined.person} just took a seat at “${after.title}”`, 'info'), 0)
          }
        }
        return next
      })
    }, 4200)
    return () => clearInterval(tick)
  }, [screen, addToast])

  return (
    <div className="app">
      <div className="grain" aria-hidden="true" />
      {screen === 'welcome' && (
        <Welcome onNext={finishWelcome} onAuthed={handleAuthed} authedEmail={auth?.email} onAbout={openAbout} />
      )}
      {screen === 'about' && <About onBack={closeAbout} />}
      {screen === 'profile' && <Profile onNext={finishProfile} />}
      {screen === 'interests' && <Interests onNext={finishInterests} />}
      {screen === 'availability' && <Availability onNext={finishAvailability} />}
      {screen === 'questions' && <Questions onNext={finishQuestions} />}
      {screen === 'matching' && <Matching user={user} onDone={finishMatching} />}
      {screen === 'home' && (
        <Home
          user={user}
          events={events}
          onToggleJoin={toggleJoin}
          onReset={resetDemo}
          auth={auth?.email ? auth : null}
          onAuthed={handleAuthed}
          onAbout={openAbout}
        />
      )}

      <div className="toasts" role="status">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.tone}`}>{t.text}</div>
        ))}
      </div>
    </div>
  )
}
