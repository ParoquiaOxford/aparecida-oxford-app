import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

type AuthMode = 'signin' | 'signup'

interface FormValues {
  name: string
  email: string
  password: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

function Login() {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [values, setValues] = useState<FormValues>({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [formError, setFormError] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signUp } = useAuth()

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {}

    if (mode === 'signup' && !values.name.trim()) {
      nextErrors.name = 'Nome é obrigatório.'
    }

    if (!values.email.includes('@')) {
      nextErrors.email = 'Email inválido.'
    }

    if (values.password.length < 6) {
      nextErrors.password = 'Senha deve ter ao menos 6 caracteres.'
    }

    return nextErrors
  }

  const handleChange = (field: keyof FormValues) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues((previousValues) => ({ ...previousValues, [field]: event.target.value }))
  }

  const toggleMode = () => {
    setMode((previousMode) => (previousMode === 'signin' ? 'signup' : 'signin'))
    setErrors({})
    setFormError('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')
    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSubmitting(true)

    try {
      if (mode === 'signin') {
        await signIn({ email: values.email, password: values.password })
      } else {
        await signUp({ name: values.name, email: values.email, password: values.password })
      }

      const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/'
      navigate(fromPath, { replace: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível autenticar. Tente novamente.'
      setFormError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box className="min-h-screen flex items-center justify-center p-4">
      <Paper elevation={3} className="w-full max-w-md rounded-lg p-6">
        <Stack spacing={3} component="form" onSubmit={handleSubmit}>
          <Typography variant="h5" textAlign="center">
            {mode === 'signin' ? 'Entrar na plataforma' : 'Criar conta'}
          </Typography>

          {formError ? <Alert severity="error">{formError}</Alert> : null}

          {mode === 'signup' ? (
            <TextField
              label="Nome"
              value={values.name}
              onChange={handleChange('name')}
              error={Boolean(errors.name)}
              helperText={errors.name}
              fullWidth
            />
          ) : null}

          <TextField
            label="Email"
            type="email"
            value={values.email}
            onChange={handleChange('email')}
            error={Boolean(errors.email)}
            helperText={errors.email}
            fullWidth
          />

          <TextField
            label="Senha"
            type="password"
            value={values.password}
            onChange={handleChange('password')}
            error={Boolean(errors.password)}
            helperText={errors.password}
            fullWidth
          />

          <Button type="submit" variant="contained" disabled={submitting}>
            {mode === 'signin' ? 'Entrar' : 'Cadastrar'}
          </Button>

          <Button variant="text" onClick={toggleMode}>
            {mode === 'signin' ? 'Ainda não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}

export default Login
