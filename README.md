# Stammtisch — AI-scaffolded small-group activity platform

Matches strangers into small groups (3–5) around a shared interest, time,
and place, then helps the group actually meet up. Events are the central
object; the AI scaffolds (clusters, shortlists real venues, runs the group
decision, validates) while humans hold the taste decisions. München first.

## Layout

```
backend/   Express + TypeScript, raw SQL (SQLite default, Postgres via DATABASE_URL)
frontend/  Vite/React app (the original demo prototype, being rewired to the API)
evals/     offline eval harness (venue validity, constraints, decision metrics)
docs/      BUILD_PLAN.md — build order, status, decisions
```

## Run

```bash
# backend
cd backend
npm install
npm run seed:dev    # seed ~50 venues + 20 users
npm run dev         # http://localhost:8000

# tests
npm test

# frontend (standalone demo for now; API wiring is build step 9)
cd frontend && npm install && npm run dev   # http://localhost:5173
```

No external credentials are required: places data is seeded, the LLM and
embedder default to deterministic stubs (Anthropic SDK becomes available
when `ANTHROPIC_API_KEY` is set — never a hard dependency), and
notifications log to console.

## Auth (real accounts)

Behind an `AuthProvider` seam (`backend/src/providers/auth.ts`):

- **Stub mode (default, zero config):** any email logs in instantly; the
  "magic link" returns a token immediately. Great for demos and tests.
- **Supabase mode:** uncomment and fill `SUPABASE_URL` +
  `SUPABASE_PUBLISHABLE_KEY` in `backend/.env` (see `.env.example`;
  publishable key only — never the service_role key). You get:
  - **Email magic links** — `POST /auth/magic-link`; the emailed link
    redirects back to the frontend with the session token.
  - **Google login** — enable the Google provider in the Supabase dashboard
    (Authentication → Providers), and the frontend's "Continue with Google"
    button appears automatically.
  - Email+password endpoints also exist for scripts/tests.

Also add the frontend URL to Supabase → Authentication → URL Configuration
→ Redirect URLs (e.g. `http://localhost:5173`).

## Deploy (Render)

`render.yaml` defines two services: `stammtisch-api` (Express) and
`stammtisch-web` (static Vite build), wired to each other's URLs. Create a
Blueprint in Render pointing at this repo, then set `SUPABASE_URL` and
`SUPABASE_PUBLISHABLE_KEY` in the API service's environment. For persistent
data, attach a Render Postgres and set `DATABASE_URL` (SQLite on Render is
ephemeral). Remember to add the Render frontend URL to Supabase's redirect
allow-list.
