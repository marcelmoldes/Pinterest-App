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
  email:string
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
