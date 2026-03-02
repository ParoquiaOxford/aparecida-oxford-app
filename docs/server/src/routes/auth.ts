import { Router } from 'express'
import { UserModel } from '../models/User'

const authRouter = Router()

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

authRouter.post('/login', async (request, response) => {
  const { email, password } = request.body as { email?: string; password?: string }
  const normalizedEmail = email?.trim()

  if (!normalizedEmail || !password) {
    return response.status(400).json({ message: 'Email e senha são obrigatórios.' })
  }

  try {
    const dbUser = await UserModel.findOne({
      Email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: 'i' },
      Pass: password,
    }).lean()

    if (!dbUser) {
      return response.status(401).json({ message: 'Credenciais inválidas.' })
    }

    const role = dbUser.role?.toLowerCase().startsWith('adm') ? 'admin' : 'member'
    const token = `mongo-auth-${dbUser._id}-${Date.now()}`

    return response.json({
      token,
      user: {
        id: String(dbUser._id),
        name: dbUser.User,
        email: dbUser.Email,
        role,
      },
    })
  } catch {
    return response.status(500).json({ message: 'Erro ao autenticar usuário.' })
  }
})

export { authRouter }
