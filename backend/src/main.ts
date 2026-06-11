/** Server entrypoint: `npm run dev` (tsx watch) or `node dist/main.js`. */
import { createApp } from './app.js'
import { createDb, ensureSchema } from './db.js'

const db = createDb()
await ensureSchema(db)

const port = Number(process.env.PORT ?? 8000)
createApp(db).listen(port, () => {
  console.log(`Stammtisch API listening on http://localhost:${port}`)
})
