import axios, { type AxiosError, type AxiosInstance } from 'axios'
import type { IUser } from '../@types/user'
import type { IDocument } from '../@types/document'
import type { IPlaylist, ISong } from '../@types/playlist'

interface DocumentsResponse {
  documents: IDocument[]
}

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  token: string
  user: IUser
}

interface PlaylistResponse {
  playlist: IPlaylist
}

interface SongsResponse {
  playlist: IPlaylist
  songs: ISong[]
  playlistName: string
  sourceCollection: string
}

interface CreateSongPayload {
  title: string
  category: string
  lyrics: string
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'

export const api: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

const fallbackDocuments: IDocument[] = [
  {
    _id: '1',
    title: 'Bem-vindo ao dashboard',
    content: 'Configure o backend em docs/server/.env para consumir dados reais do Atlas.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export async function fetchDocuments(): Promise<IDocument[]> {
  try {
    const response = await api.get<DocumentsResponse>('/documents')

    return response.data.documents
  } catch {
    return fallbackDocuments
  }
}

export async function loginWithMongo(payload: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await api.post<LoginResponse>('/auth/login', payload)

    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>
    const apiMessage = axiosError.response?.data?.message

    if (apiMessage) {
      throw new Error(apiMessage)
    }

    if (axiosError.code === 'ERR_NETWORK') {
      throw new Error('Servidor de autenticação indisponível. Inicie o backend em docs/server.')
    }

    if (axiosError.response?.status === 404) {
      throw new Error('Endpoint de login não encontrado. Verifique a URL da API.')
    }

    throw new Error('Falha ao autenticar no servidor.')
  }
}

export async function fetchCurrentPlaylist(): Promise<IPlaylist> {
  try {
    const response = await api.get<SongsResponse>('/playlist/songs')

    return response.data.playlist
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>
    const apiMessage = axiosError.response?.data?.message

    if (apiMessage) {
      throw new Error(apiMessage)
    }

    if (axiosError.code === 'ERR_NETWORK') {
      throw new Error('Servidor indisponível para carregar playlists.')
    }

    throw new Error('Falha ao carregar playlist do MongoDB.')
  }
}

export async function addSongToPlaylist(payload: CreateSongPayload): Promise<IPlaylist> {
  try {
    const response = await api.post<PlaylistResponse>('/playlist/songs', payload)

    return response.data.playlist
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>
    const apiMessage = axiosError.response?.data?.message

    if (apiMessage) {
      throw new Error(apiMessage)
    }

    if (axiosError.code === 'ERR_NETWORK') {
      throw new Error('Servidor indisponível para adicionar música.')
    }

    throw new Error('Falha ao adicionar nova música na playlist.')
  }
}

export async function deleteSongFromPlaylist(songId: number): Promise<IPlaylist> {
  try {
    const response = await api.delete<PlaylistResponse>(`/playlist/songs/${songId}`)

    return response.data.playlist
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>
    const apiMessage = axiosError.response?.data?.message

    if (apiMessage) {
      throw new Error(apiMessage)
    }

    if (axiosError.code === 'ERR_NETWORK') {
      throw new Error('Servidor indisponível para excluir música.')
    }

    throw new Error('Falha ao excluir música da playlist.')
  }
}

export async function generatePowerPoint(playlistName: string, songs: ISong[]): Promise<Blob> {
  const response = await api.post('/ppt/generate', { playlistName, songs }, { responseType: 'blob' })

  return response.data as Blob
}
