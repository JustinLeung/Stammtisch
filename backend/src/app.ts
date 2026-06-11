/** Express app factory. v1 endpoints land incrementally; auth + /venues so far. */
import path from 'node:path'

import cors from 'cors'
import express, { type NextFunction, type Request, type Response } from 'express'

import * as config from './config.js'
import { authRouter } from './api/auth.js'
import type { Db } from './db.js'
import { SeededPlacesProvider } from './providers/places.js'
import { type AuthProvider, getAuthProvider } from './providers/auth.js'

export interface AppOptions {
  provider?: AuthProvider
  /** Serve a built frontend (Vite dist/) from this app — single-service deploys. */
  staticDir?: string
}

export function createApp(db: Db, opts: AppOptions = {}): express.Express {
  const provider = opts.provider ?? getAuthProvider()
  const app = express()

  app.use(cors({ origin: [config.FRONTEND_ORIGIN, 'http://localhost:5173'] }))
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.json({ ok: true, auth_mode: config.authMode() })
  })

  app.get('/venues', async (req, res) => {
    const area = typeof req.query.area === 'string' ? req.query.area : undefined
    const places = new SeededPlacesProvider(db)
    const venues = await places.search({ area })
    res.json(
      venues.map((v) => ({
        id: v.id, name: v.name, area: v.area, category: v.category,
        price_band: v.price_band, tags: v.tags,
      })),
    )
  })

  app.use('/auth', authRouter(db, provider))

  if (opts.staticDir) {
    const indexHtml = path.join(opts.staticDir, 'index.html')
    app.use(express.static(opts.staticDir))
    // SPA fallback: any unmatched GET that wants HTML gets the app shell
    app.use((req, res, next) => {
      if (req.method === 'GET' && req.accepts('html')) res.sendFile(indexHtml)
      else next()
    })
  }

  // FastAPI-style {detail} errors; the frontend parses this shape.
  app.use((err: Error & { statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
    const status = typeof err.statusCode === 'number' ? err.statusCode : 500
    if (status >= 500) console.error(err)
    res.status(status).json({ detail: err.message || 'Internal Server Error' })
  })

  return app
}
