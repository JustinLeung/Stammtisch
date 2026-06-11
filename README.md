# Stammtisch — AI-scaffolded small-group activity platform

Matches strangers into small groups (3–5) around a shared interest, time,
and place, then helps the group actually meet up. Events are the central
object; the AI scaffolds (clusters, shortlists real venues, runs the group
decision, validates) while humans hold the taste decisions. München first.

## Layout

```
backend/   FastAPI + SQLAlchemy (SQLite default, Postgres via DATABASE_URL)
frontend/  Vite/React app (the original demo prototype, being rewired to the API)
evals/     offline eval harness (venue validity, constraints, decision metrics)
docs/      BUILD_PLAN.md — build order, status, decisions
```

## Run

```bash
# backend
cd backend
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python -m app.seeds.seed          # seed ~50 venues + 20 users
.venv/bin/uvicorn app.main:app --reload     # http://localhost:8000/docs

# tests
.venv/bin/python -m pytest tests/ -q

# frontend (standalone demo for now; API wiring is build step 9)
cd frontend && npm install && npm run dev   # http://localhost:5173
```

No external credentials are required: places data is seeded, the LLM and
embedder default to deterministic stubs (Anthropic SDK becomes available
when `ANTHROPIC_API_KEY` is set — never a hard dependency), auth is stub
login as a seeded user, and notifications log to console.
