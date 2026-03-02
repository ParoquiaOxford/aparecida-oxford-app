export type UserRole = 'admin' | 'member'

export interface IUser {
  id: string
  name: string
  email: string
  role: UserRole
}
