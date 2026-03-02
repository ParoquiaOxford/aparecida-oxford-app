import dotenv from 'dotenv'

dotenv.config()

const port = Number(process.env.PORT ?? 4000)
const mongodbUri = process.env.MONGODB_URI ?? ''
const mongodbDb = process.env.MONGODB_DB ?? 'oxford'
const mongodbCollection = process.env.MONGODB_COLLECTION ?? 'musics'
const mongodbUsersCollection = process.env.MONGODB_USERS_COLLECTION ?? 'users'
const mongodbPlaylistCollection = process.env.MONGODB_PLAYLIST_COLLECTION ?? 'musics'

if (!mongodbUri) {
  throw new Error('MONGODB_URI is required in server environment variables.')
}

export const env = {
  port,
  mongodbUri,
  mongodbDb,
  mongodbCollection,
  mongodbUsersCollection,
  mongodbPlaylistCollection,
}
