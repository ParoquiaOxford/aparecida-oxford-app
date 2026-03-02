import mongoose from 'mongoose'
import { env } from './env'

export async function connectMongo() {
  try {
    await mongoose.connect(env.mongodbUri, {
      dbName: env.mongodbDb,
    })
  } catch (error) {
    console.error('Failed to connect to MongoDB Atlas.')
    throw error
  }
}
