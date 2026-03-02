export interface ISong {
  id: number
  category: string
  title: string
  lyrics: string
  subtitle?: string
  refrain?: string
  verse?: string
  [key: string]: unknown
}

export interface IPlaylist {
  _id: string
  playlistName: string
  version: string
  lastUpdated: string
  songs: ISong[]
}
