# Build plan — AI-scaffolded small-group activity platform

Spec: see the build spec (event-centric, AI-as-scaffolder, accepted cluster
becomes host, two-phase visibility). This doc tracks the build order and the
decisions that diverge from the spec's suggestions.

## Decisions / deviations (all within the spec's "swap if you prefer")

| topic | spec suggestion | decision | why |
|---|---|---|---|
| DB | Postgres | SQLAlchemy + **SQLite default**, Postgres via `DATABASE_URL` | spec also requires zero-credential local run; models stay dialect-portable |
| Frontend | Next.js | **Vite/React** (existing app in `frontend/`) | reuses built onboarding; minimal screens only |
| LLM | Anthropic SDK | `LLMProvider` seam, **deterministic stub default**, Anthropic impl opt-in via `ANTHROPIC_API_KEY` | "no paid API as a hard dependency" |
| Embeddings | local model or API | `Embedder` seam, stub bag-of-words default | same |
| Datetimes | — | naive UTC in DB | Europe/Berlin rendering is a client concern in v1 |
| Extra entity | — | `Rating` table | needed by §10 step 6 and the §8 fit-gate eval |
| Extra UI | — | Tischkarte icebreakers kept (display-only) | existing prototype feature; harmless, remove on request |

## Build order (spec §12) and status

1. ✅ Repo scaffold, domain models + enums, seeded venues (~50, 4 neighborhoods)
   + users (20, clustered for matchability), `SeededPlacesProvider`, tests.
2. ☐ Event state machine with guarded transitions + tests (`services/lifecycle.py`).
3. ☐ Constraint merging + filtering on top of `PlacesProvider`
   (merged hard constraints: open-at, radius-of-all, budget, accessibility,
   dietary, alcohol, indoor/outdoor).
4. ☐ Matching: hard filters → `Embedder` similarity + structured features →
   greedy clustering in `(area, time_window)` buckets → `ACCEPTING` flow.
5. ☐ `LLMProvider` shortlist (validated venues only) → votes → deadline
   fallback → off-list re-validation → venue lock.
6. ☐ Threshold gate → publish → home feed API → discovery ranker
   (weighted sum: fit + convenience + social_proof + urgency).
7. ☐ Public join + fit gate (`public_join_threshold` constant, looser than
   formation).
8. ☐ Roster lock → HAPPENING → COMPLETED → ratings.
9. ☐ Frontend: rework onboarding fields, add accept / decide-vote / feed /
   detail+join / rating screens against the API (polling).
10. ☐ Eval harness in `evals/`: venue validity, constraint satisfaction,
    decision-completion rate, shortlist pick-through, fit-gate scaffold.

## Architecture notes

- **Event is the central object.** Memberships attach users to events with
  `role` (host/joiner) + `status`. "Host" is a role every event has — a
  collective (match/AI-seeded) or an individual (host-created).
- **State machine** will live in one module with an explicit transition
  table `{(from, action) -> to}` plus guard functions; API handlers never
  set `Event.status` directly.
- **Two-phase visibility**: `visibility` flips to `public` only on the
  CONFIRMED → OPEN_PUBLIC transition, which requires venue+time locked AND
  `current_size >= threshold`. The feed query is
  `status == OPEN_PUBLIC` — nothing half-formed can render.
- **Time semantics**: `time_window` (candidate) vs `scheduled_time`
  (locked). v1 host scope is venue-only; time/area fixed at formation.
