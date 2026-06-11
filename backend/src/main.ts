/** Server entrypoint: `npm run dev` (tsx watch) or `node dist/main.js`. */
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { createApp } from './app.js'
import { createDb, ensureSchema } from './db.js'

const db = createDb()
await ensureSchema(db)

// Serve the built frontend when it exists (single-service deploys). In local
// dev the Vite dev server handles the frontend, so this is usually absent.
const frontendDist = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)), '../../frontend/dist',
)
const staticDir = existsSync(frontendDist) ? frontendDist : undefined

const port = Number(process.env.PORT ?? 8000)
createApp(db, { staticDir }).listen(port, () => {
  console.log(
    `Stammtisch listening on http://localhost:${port}` +
    (staticDir ? ' (serving frontend build)' : ' (API only)'),
  )
})
