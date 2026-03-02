import { Schema, model } from 'mongoose'
import { env } from '../config/env'

export interface UserEntity {
  User: string
  Pass: string
  Email: string
  role: string
}

const userSchema = new Schema<UserEntity>(
  {
    User: {
      type: String,
      required: true,
      trim: true,
    },
    Pass: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    collection: env.mongodbUsersCollection,
  },
)

export const UserModel = model<UserEntity>('User', userSchema)
