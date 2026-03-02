import { Router } from 'express'
import { DocumentModel } from '../models/Document'

const documentsRouter = Router()

documentsRouter.get('/', async (_request, response) => {
  try {
    const documents = await DocumentModel.find({}).sort({ updatedAt: -1 }).limit(10).lean()

    response.json({ documents })
  } catch {
    response.status(500).json({ message: 'Failed to fetch documents.' })
  }
})

export { documentsRouter }
