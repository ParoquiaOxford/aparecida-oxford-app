import cors from 'cors'
import express from 'express'
import { connectMongo } from './config/mongo'
import { env } from './config/env'
import { authRouter } from './routes/auth'
import { documentsRouter } from './routes/documents'
import { playlistRouter } from './routes/playlist'
import { pptRouter } from './routes/ppt'

async function bootstrap() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get('/health', (_request, response) => {
    response.json({ ok: true })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/documents', documentsRouter)
  app.use('/api/playlist', playlistRouter)
  app.use('/api/ppt', pptRouter)

  await connectMongo()

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`)
  })
}

bootstrap().catch((error) => {
  console.error('Server startup failed.')
  console.error(error)
  process.exit(1)
})
