import { Schema, model } from 'mongoose'
import { env } from '../config/env'

export interface DocumentEntity {
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

const documentSchema = new Schema<DocumentEntity>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: env.mongodbCollection,
  },
)

export const DocumentModel = model<DocumentEntity>('Document', documentSchema)
