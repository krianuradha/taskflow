import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { connectDB } from './lib/db.js'
import authRoutes from './routes/auth.routes.js'
import projectRoutes from './routes/project.routes.js'
import taskRoutes from './routes/task.routes.js'
import noteRoutes from './routes/note.routes.js'

const app = express()
connectDB()

// ── CORS ────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',')
      : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// ── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ── Uploadthing (lazy — only mounts if package is installed) ─────────────────
try {
  const { createRouteHandler } = await import('uploadthing/express')
  const { uploadRouter } = await import('./uploadthing.js')
  if (Object.keys(uploadRouter).length > 0) {
    app.use('/api/uploadthing', createRouteHandler({ router: uploadRouter }))
    console.log('Uploadthing router mounted at /api/uploadthing')
  }
} catch {
  // uploadthing not installed — skip silently
}

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/projects', projectRoutes)
app.use('/api/v1/tasks', taskRoutes)
app.use('/api/v1/notes', noteRoutes)

// ── Healthcheck ──────────────────────────────────────────────────────────────
app.use('/api/v1/healthcheck', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
)

// ── Root ─────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: 'TaskFlow API is running' }))

// ── Global Error Handler — MUST be last ─────────────────────────────────────
app.use((err, req, res, next) => {
  const status = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  if (process.env.NODE_ENV !== 'production') console.error(err.stack)
  res.status(status).json({
    success: false,
    message,
    errors: err.errors || [],
  })
})

// ── Local dev server — Only start if run directly (standalone mode) ──────────
import url from 'url'
if (import.meta.url === url.pathToFileURL(process.argv[1]).href) {
  const PORT = process.env.PORT || 8000
  app.listen(PORT, () =>
    console.log(`Standalone Express server running on http://localhost:${PORT}`)
  )
}

export default app // ← CRITICAL for Vercel serverless / Next.js integration
