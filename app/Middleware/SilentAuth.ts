import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class SilentAuthMiddleware {
  public async handle({ auth, view }: HttpContextContract, next: () => Promise<void>) {
    await auth.check()

    if (auth.isLoggedIn && auth.user) {
      try {
        const user = await User.query().where('id', auth.user.id).preload('profile').firstOrFail()
        view.share({
          profile: user.profile,
        })
      } catch (error) {
        console.error(error)
      }
    }
    await next()
  }
}
