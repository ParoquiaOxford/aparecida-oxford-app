import { Router } from 'express'
import mongoose from 'mongoose'
import { PlaylistModel } from '../models/Playlist'
import { env } from '../config/env'

const playlistRouter = Router()

const allowedCategories = [
  'Entrada',
  'Ato Penitencial',
  'Hino de Louvor',
  'Salmo',
  'Aclamação',
  'Ofertório',
  'Rito Comum',
  'Comunhão',
  'Final',
]

function looksLikePlaylist(document: unknown): document is { songs: unknown[] } {
  if (!document || typeof document !== 'object') {
    return false
  }

  const candidate = document as { songs?: unknown }
  return Array.isArray(candidate.songs)
}

async function findPlaylistInAnyCollection() {
  const directPlaylist = await PlaylistModel.findOne({}).sort({ _id: -1 }).lean()

  if (directPlaylist) {
    return {
      playlist: directPlaylist,
      sourceCollection: env.mongodbPlaylistCollection,
    }
  }

  const database = mongoose.connection.db

  if (!database) {
    return null
  }

  const collections = await database.listCollections({}, { nameOnly: true }).toArray()
  const candidates = collections
    .map((collection) => collection.name)
    .filter((name) => !name.startsWith('system.'))
    .filter((name) => name !== env.mongodbUsersCollection)
    .filter((name) => name !== env.mongodbPlaylistCollection)

  for (const collectionName of candidates) {
    const possiblePlaylist = await database.collection(collectionName).findOne({ songs: { $type: 'array' } })

    if (looksLikePlaylist(possiblePlaylist)) {
      return {
        playlist: possiblePlaylist,
        sourceCollection: collectionName,
      }
    }
  }

  return null
}

function normalizeSongs(input: unknown) {
  return Array.isArray(input) ? (input as Array<Record<string, unknown>>) : []
}

playlistRouter.get('/current', async (_request, response) => {
  try {
    const playlistResult = await findPlaylistInAnyCollection()

    if (!playlistResult) {
      return response.status(404).json({
        message: `Nenhuma playlist encontrada (coleção configurada: ${env.mongodbPlaylistCollection}).`,
      })
    }

    return response.json({
      playlist: playlistResult.playlist,
      sourceCollection: playlistResult.sourceCollection,
    })
  } catch {
    return response.status(500).json({ message: 'Falha ao buscar playlist.' })
  }
})

playlistRouter.get('/songs', async (_request, response) => {
  try {
    const playlistResult = await findPlaylistInAnyCollection()

    if (!playlistResult) {
      return response.status(404).json({
        message: `Nenhuma playlist encontrada na coleção configurada (${env.mongodbPlaylistCollection}).`,
      })
    }

    return response.json({
      playlist: playlistResult.playlist,
      songs: normalizeSongs(playlistResult.playlist.songs),
      playlistName: (playlistResult.playlist as { playlistName?: string }).playlistName ?? 'Repertório',
      sourceCollection: playlistResult.sourceCollection,
    })
  } catch {
    return response.status(500).json({ message: 'Falha ao listar músicas.' })
  }
})

playlistRouter.post('/songs', async (request, response) => {
  const { title, category, lyrics } = request.body as {
    title?: string
    category?: string
    lyrics?: string
  }

  const normalizedTitle = title?.trim()
  const normalizedCategory = category?.trim()
  const normalizedLyrics = lyrics?.trim()

  if (!normalizedTitle || !normalizedCategory || !normalizedLyrics) {
    return response.status(400).json({ message: 'Título, categoria e letra são obrigatórios.' })
  }

  if (!allowedCategories.includes(normalizedCategory)) {
    return response.status(400).json({ message: 'Categoria inválida.' })
  }

  try {
    const playlistResult = await findPlaylistInAnyCollection()

    if (!playlistResult) {
      return response.status(404).json({ message: 'Nenhuma playlist encontrada para adicionar música.' })
    }

    const existingSongs = Array.isArray(playlistResult.playlist.songs)
      ? (playlistResult.playlist.songs as Array<{ id?: number | string }>)
      : []

    const nextId = existingSongs.length > 0 ? Math.max(...existingSongs.map((song) => Number(song.id) || 0)) + 1 : 1
    const nextSong = {
      id: nextId,
      category: normalizedCategory,
      title: normalizedTitle,
      lyrics: normalizedLyrics,
    }
    const nextLastUpdated = new Date().toISOString().slice(0, 10)

    if (playlistResult.sourceCollection === env.mongodbPlaylistCollection) {
      const playlistDocument = await PlaylistModel.findById(playlistResult.playlist._id)

      if (!playlistDocument) {
        return response.status(404).json({ message: 'Playlist não encontrada para atualização.' })
      }

      playlistDocument.songs.push(nextSong)
      playlistDocument.lastUpdated = nextLastUpdated
      await playlistDocument.save()

      return response.status(201).json({
        playlist: playlistDocument.toObject(),
        sourceCollection: playlistResult.sourceCollection,
      })
    }

    const database = mongoose.connection.db

    if (!database) {
      return response.status(500).json({ message: 'Banco de dados indisponível para atualização.' })
    }

    await database.collection<Record<string, unknown>>(playlistResult.sourceCollection).updateOne(
      { _id: playlistResult.playlist._id },
      {
        $push: { songs: nextSong as unknown as never },
        $set: { lastUpdated: nextLastUpdated },
      },
    )

    const updatedPlaylist = await database
      .collection(playlistResult.sourceCollection)
      .findOne({ _id: playlistResult.playlist._id })

    if (!updatedPlaylist) {
      return response.status(500).json({ message: 'Não foi possível recuperar playlist atualizada.' })
    }

    return response.status(201).json({
      playlist: updatedPlaylist,
      sourceCollection: playlistResult.sourceCollection,
    })
  } catch {
    return response.status(500).json({ message: 'Falha ao adicionar nova música.' })
  }
})

playlistRouter.delete('/songs/:songId', async (request, response) => {
  const songId = Number(request.params.songId)

  if (!Number.isFinite(songId) || songId <= 0) {
    return response.status(400).json({ message: 'ID da música inválido.' })
  }

  try {
    const playlistResult = await findPlaylistInAnyCollection()

    if (!playlistResult) {
      return response.status(404).json({ message: 'Nenhuma playlist encontrada para remover música.' })
    }

    const existingSongs = normalizeSongs(playlistResult.playlist.songs)
    const nextSongs = existingSongs.filter((song) => Number(song.id) !== songId)

    if (nextSongs.length === existingSongs.length) {
      return response.status(404).json({ message: 'Música não encontrada na playlist.' })
    }

    const nextLastUpdated = new Date().toISOString().slice(0, 10)

    if (playlistResult.sourceCollection === env.mongodbPlaylistCollection) {
      const playlistDocument = await PlaylistModel.findById(playlistResult.playlist._id)

      if (!playlistDocument) {
        return response.status(404).json({ message: 'Playlist não encontrada para atualização.' })
      }

      playlistDocument.songs = nextSongs as typeof playlistDocument.songs
      playlistDocument.lastUpdated = nextLastUpdated
      await playlistDocument.save()

      return response.json({
        playlist: playlistDocument.toObject(),
        sourceCollection: playlistResult.sourceCollection,
      })
    }

    const database = mongoose.connection.db

    if (!database) {
      return response.status(500).json({ message: 'Banco de dados indisponível para atualização.' })
    }

    await database.collection(playlistResult.sourceCollection).updateOne(
      { _id: playlistResult.playlist._id },
      {
        $set: { songs: nextSongs, lastUpdated: nextLastUpdated },
      },
    )

    const updatedPlaylist = await database
      .collection(playlistResult.sourceCollection)
      .findOne({ _id: playlistResult.playlist._id })

    if (!updatedPlaylist) {
      return response.status(500).json({ message: 'Não foi possível recuperar playlist atualizada.' })
    }

    return response.json({
      playlist: updatedPlaylist,
      sourceCollection: playlistResult.sourceCollection,
    })
  } catch {
    return response.status(500).json({ message: 'Falha ao excluir música.' })
  }
})

export { allowedCategories, playlistRouter }
