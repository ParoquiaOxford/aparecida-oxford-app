import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { Trash2 } from 'lucide-react'
import type { IPlaylist, ISong } from '../@types/playlist'
import { addSongToPlaylist, deleteSongFromPlaylist, fetchCurrentPlaylist, generatePowerPoint } from '../services/api'
import { useEffect } from 'react'

const liturgicalCategories = [
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

function MusicProjector() {
  const [playlist, setPlaylist] = useState<IPlaylist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedSongIds, setSelectedSongIds] = useState<number[]>([])
  const [generatingPpt, setGeneratingPpt] = useState(false)
  const [creatingSong, setCreatingSong] = useState(false)
  const [deletingSongId, setDeletingSongId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(liturgicalCategories[0])
  const [lyrics, setLyrics] = useState('')

  const loadPlaylist = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetchCurrentPlaylist()
      setPlaylist(response)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Falha ao carregar playlist do MongoDB. Verifique backend e coleção de playlists.'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadPlaylist()
  }, [])

  const songsByCategory = useMemo(() => {
    const grouped = new Map<string, ISong[]>()

    playlist?.songs.forEach((song) => {
      const bucket = grouped.get(song.category) ?? []
      bucket.push(song)
      grouped.set(song.category, bucket)
    })

    return grouped
  }, [playlist])

  const selectedSongs = useMemo(
    () => playlist?.songs.filter((song) => selectedSongIds.includes(song.id)) ?? [],
    [playlist, selectedSongIds],
  )

  const toggleSong = (songId: number) => {
    setSelectedSongIds((currentIds) =>
      currentIds.includes(songId) ? currentIds.filter((id) => id !== songId) : [...currentIds, songId],
    )
  }

  const handleGeneratePowerPoint = async () => {
    if (!playlist || selectedSongs.length === 0) {
      setError('Selecione ao menos uma música para gerar o PowerPoint.')
      return
    }

    setGeneratingPpt(true)
    setError('')
    setSuccess('')

    try {
      const blob = await generatePowerPoint(playlist.playlistName, selectedSongs)
      const fileName = `${playlist.playlistName.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pptx`

      const downloadUrl = URL.createObjectURL(blob)
      const linkElement = document.createElement('a')
      linkElement.href = downloadUrl
      linkElement.download = fileName
      document.body.appendChild(linkElement)
      linkElement.click()
      linkElement.remove()
      URL.revokeObjectURL(downloadUrl)

      setSuccess('PowerPoint gerado com sucesso.')
    } catch {
      setError('Não foi possível gerar o PowerPoint.')
    } finally {
      setGeneratingPpt(false)
    }
  }

  const handleCreateSong = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!title.trim() || !category.trim() || !lyrics.trim()) {
      setError('Preencha título, categoria e letra antes de adicionar.')
      return
    }

    setCreatingSong(true)

    try {
      const updatedPlaylist = await addSongToPlaylist({
        title: title.trim(),
        category,
        lyrics: lyrics.trim(),
      })

      setPlaylist(updatedPlaylist)
      setTitle('')
      setLyrics('')
      setSuccess('Música adicionada com sucesso.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao adicionar nova música na playlist.'
      setError(message)
    } finally {
      setCreatingSong(false)
    }
  }

  const handleDeleteSong = async (songId: number) => {
    setError('')
    setSuccess('')
    setDeletingSongId(songId)

    try {
      const updatedPlaylist = await deleteSongFromPlaylist(songId)
      setPlaylist(updatedPlaylist)
      setSelectedSongIds((currentIds) => currentIds.filter((id) => id !== songId))
      setSuccess('Música excluída com sucesso.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao excluir música da playlist.'
      setError(message)
    } finally {
      setDeletingSongId(null)
    }
  }

  if (loading) {
    return <CircularProgress />
  }

  return (
    <Stack spacing={3}>
      <Box className="flex items-center justify-between">
        <Box>
          <Typography variant="h5">Projeta Música App</Typography>
          <Typography variant="body2" color="text.secondary">
            {playlist ? `${playlist.playlistName} • versão ${playlist.version} • atualizado em ${playlist.lastUpdated}` : ''}
          </Typography>
        </Box>
        <Button variant="contained" onClick={handleGeneratePowerPoint} disabled={generatingPpt || selectedSongs.length === 0}>
          {generatingPpt ? 'Gerando...' : `Gerar PowerPoint (${selectedSongs.length})`}
        </Button>
      </Box>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper className="rounded-lg p-4">
            <Typography variant="h6" className="mb-2">
              Adicionar nova música
            </Typography>
            <Box component="form" className="grid gap-3" onSubmit={handleCreateSong}>
              <TextField label="Título" value={title} onChange={(event) => setTitle(event.target.value)} fullWidth />

              <FormControl fullWidth>
                <InputLabel id="category-label">Categoria</InputLabel>
                <Select
                  labelId="category-label"
                  label="Categoria"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  {liturgicalCategories.map((categoryName) => (
                    <MenuItem key={categoryName} value={categoryName}>
                      {categoryName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Letra"
                value={lyrics}
                onChange={(event) => setLyrics(event.target.value)}
                multiline
                minRows={10}
                fullWidth
              />

              <Button type="submit" variant="contained" disabled={creatingSong}>
                {creatingSong ? 'Adicionando...' : 'Adicionar música'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper className="rounded-lg p-4">
            <Typography variant="h6" className="mb-2">
              Seleção de músicas por categoria
            </Typography>
            <Divider className="mb-2" />
            <Stack spacing={2}>
              {liturgicalCategories.map((categoryName) => {
                const songs = songsByCategory.get(categoryName) ?? []

                return (
                  <Paper key={categoryName} variant="outlined" className="rounded-lg p-3">
                    <Typography variant="subtitle1" fontWeight={700}>
                      {categoryName} ({songs.length})
                    </Typography>
                    {songs.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Nenhuma música cadastrada.
                      </Typography>
                    ) : (
                      <List dense>
                        {songs.map((song) => (
                          <ListItem
                            key={song.id}
                            disablePadding
                            secondaryAction={
                              <Tooltip title="Excluir">
                                <span>
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => handleDeleteSong(song.id)}
                                    disabled={deletingSongId === song.id}
                                    aria-label="Excluir música"
                                  >
                                    {deletingSongId === song.id ? (
                                      <CircularProgress size={16} color="inherit" />
                                    ) : (
                                      <Trash2 width={20} height={20} />
                                    )}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            }
                          >
                            <ListItemIcon>
                              <Checkbox
                                checked={selectedSongIds.includes(song.id)}
                                onChange={() => toggleSong(song.id)}
                                edge="start"
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={song.title}
                              secondary={
                                song.subtitle
                                  ? `${song.subtitle} • ${song.lyrics.slice(0, 80)}...`
                                  : `${song.lyrics.slice(0, 90)}...`
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Paper>
                )
              })}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  )
}

export default MusicProjector
