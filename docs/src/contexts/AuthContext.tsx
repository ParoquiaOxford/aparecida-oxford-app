import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { IUser } from '../@types/user'
import { loginWithMongo } from '../services/api'

const STORAGE_TOKEN_KEY = 'ns-aparecida-token'
const STORAGE_USER_KEY = 'ns-aparecida-user'

interface SignInPayload {
  email: string
  password: string
}

interface SignUpPayload {
  name: string
  email: string
  password: string
}

export interface AuthContextType {
  user: IUser | null
  token: string | null
  isAuthenticated: boolean
  isHydrating: boolean
  signIn: (payload: SignInPayload) => Promise<void>
  signUp: (payload: SignUpPayload) => Promise<void>
  signOut: () => void
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<IUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isHydrating, setIsHydrating] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY)
    const storedUser = localStorage.getItem(STORAGE_USER_KEY)

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as IUser
        setUser(parsedUser)
        setToken(storedToken)
      } catch {
        localStorage.removeItem(STORAGE_TOKEN_KEY)
        localStorage.removeItem(STORAGE_USER_KEY)
      }
    }

    setIsHydrating(false)
  }, [])

  const signIn = async ({ email, password }: SignInPayload) => {
    const authResponse = await loginWithMongo({ email, password })
    const nextUser = authResponse.user
    const nextToken = authResponse.token

    setUser(nextUser)
    setToken(nextToken)
    localStorage.setItem(STORAGE_TOKEN_KEY, nextToken)
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(nextUser))
  }

  const signUp = async ({ name, email }: SignUpPayload) => {
    const nextToken = `mock-jwt-token-${btoa(email).replace(/=/g, '')}`
    const nextUser: IUser = {
      id: crypto.randomUUID(),
      name,
      email,
      role: 'member',
    }

    setUser(nextUser)
    setToken(nextToken)
    localStorage.setItem(STORAGE_TOKEN_KEY, nextToken)
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(nextUser))
  }

  const signOut = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem(STORAGE_TOKEN_KEY)
    localStorage.removeItem(STORAGE_USER_KEY)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isHydrating,
      signIn,
      signUp,
      signOut,
    }),
    [isHydrating, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
