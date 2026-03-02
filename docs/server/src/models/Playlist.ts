import { Schema, model } from 'mongoose'
import { env } from '../config/env'

export interface SongEntity {
  id: number
  category: string
  title: string
  lyrics: string
  [key: string]: unknown
}

export interface PlaylistEntity {
  playlistName: string
  version: string
  lastUpdated: string
  songs: SongEntity[]
}

const songSchema = new Schema<SongEntity>(
  {
    id: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    lyrics: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
    strict: false,
  },
)

const playlistSchema = new Schema<PlaylistEntity>(
  {
    playlistName: {
      type: String,
      required: true,
      trim: true,
    },
    version: {
      type: String,
      required: true,
      trim: true,
    },
    lastUpdated: {
      type: String,
      required: true,
      trim: true,
    },
    songs: {
      type: [songSchema],
      required: true,
      default: [],
    },
  },
  {
    collection: env.mongodbPlaylistCollection,
  },
)

export const PlaylistModel = model<PlaylistEntity>('Playlist', playlistSchema)
