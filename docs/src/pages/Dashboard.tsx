import { useEffect, useState } from 'react'
import { Alert, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material'
import type { IDocument } from '../@types/document'
import { useAuth } from '../hooks/useAuth'
import { fetchDocuments } from '../services/api'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [documents, setDocuments] = useState<IDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetchDocuments()
        setDocuments(response)
      } catch {
        setError('Falha ao consultar documentos no serviço de dados.')
      } finally {
        setLoading(false)
      }
    }

    void loadDocuments()
  }, [])

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Olá, {user?.name}</Typography>
      <Typography variant="body1">Visão geral da aplicação com Context API, MUI, Tailwind e Axios tipado.</Typography>
      <Button variant="contained" onClick={() => navigate('/projeta-musica')} className="w-fit">
        Gerar PowerPoint
      </Button>

      {loading ? (
        <CircularProgress />
      ) : (
        <Stack spacing={2}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {documents.map((document) => (
            <Paper key={document._id} className="rounded-lg p-4">
              <Typography variant="h6">{document.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {document.content}
              </Typography>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  )
}

export default Dashboard
