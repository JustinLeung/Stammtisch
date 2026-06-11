# Stammtisch

> Strangers, seated. — AI-grouped social events, launching in München.

A demoable prototype. Users onboard by sharing **who they are → what they're
into → when they're free**. A mock "AI" then drafts events ("tables") that
match their interests to slots they actually marked free, and seats them with
other Münchner. When **more than 3 people confirm**, a table hits critical
mass and opens up to the whole city.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Demo script (~90 seconds)

1. **Welcome** — enter a name, pick a Viertel.
2. **Interests** — pick 3+ chips (color = category).
3. **Availability** — drag-paint the week grid, or tap a preset like
   "After work".
4. **Tischkarte** — answer 3 icebreaker questions drawn at random from a
   pool (hit ↻ to deal a different one). The answers become the "place
   card" your tablemates see, shown on the home screen.
5. **Matching moment** — the AI "reads the city" and drafts your tables.
6. **Home** — "Your tables": the first one is seeded at 3/4 confirmed, so
   hitting **Confirm seat** crosses critical mass live → unlock toast, badge
   flips from FORMING to OPEN TO ALL.
6. Leave it running: a simulation has fake Münchner join tables every few
   seconds, so other tables cross the threshold on their own during the demo.
7. "Open in München" shows tables that already hit critical mass — anyone
   can grab a seat.
8. **Reset demo** (top right) wipes localStorage to run it again.

## What's mocked

- **AI grouping/generation**: deterministic generator in `src/engine.js`
  (interest × availability → event template + Munich venue + seeded
  participants). Swap for a real LLM call later.
- **Other users**: a 4.2s interval simulation adds fake participants.
- **Persistence**: localStorage only — no backend.

## Design

A modern take on Otl Aicher's Munich '72 Olympic design language: warm cream
paper, the Aicher palette (alpine blue / leaf green / sun orange / yellow),
geometric arcs, Bricolage Grotesque + Schibsted Grotesk + Spline Sans Mono.
The product metaphor is the Bavarian *Stammtisch* — the regulars' table.
