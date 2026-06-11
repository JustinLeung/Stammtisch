// Thin client for the Stammtisch API. Every call degrades gracefully —
// if the backend is down, the app keeps working as a local-only demo.
// Dev: Vite on 5173 talks to the API on 8000. Production: the Express app
// serves this build itself, so API calls are same-origin ('').
const API_URL =
  import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:8000' : '')

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (token) headers['Authorization'] = `Bearer ${token}`
  const resp = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok) {
    throw new Error(data.detail?.[0]?.msg ?? data.detail ?? `Request failed (${resp.status})`)
  }
  return data
}

export const getAuthConfig = () => request('/auth/config')
export const sendMagicLink = (email) => request('/auth/magic-link', { method: 'POST', body: { email } })
export const fetchMe = (token) => request('/auth/me', { token })

// Tokens arrive in the URL fragment after magic-link / Google redirects:
// https://app/#access_token=...&refresh_token=...
export function captureRedirectToken() {
  if (!window.location.hash.includes('access_token')) return null
  const params = new URLSearchParams(window.location.hash.slice(1))
  const token = params.get('access_token')
  if (token) history.replaceState(null, '', window.location.pathname)
  return token
}
