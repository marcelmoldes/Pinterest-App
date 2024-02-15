interface CreateUserType {
  firstName: string
  lastName: string
  email: string
  password: string
}

interface updateOrCreateProfileType {
  firstName: string
  lastName: string
  userId: number
}

interface CreateOrFindOAuthUserType {
  firstName: string
  lastName: string
  email: string
  avatarUrl?: string
  socialAuth?: string
}
interface UpdateProfileType {
  id: number
  lastName?: string
  firstName?: string
  password?: string
  storagePrefix?: string
}
interface StorePostType {
  description: string
  title: string
  userId: number
  storagePrefix: string
  tags: string[]
}
interface UpdatePostType {
  id: number
  title?: string
  description?: string
  storagePrefix?: string
  tags: string[]
}
