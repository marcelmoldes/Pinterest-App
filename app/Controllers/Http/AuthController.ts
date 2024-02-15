import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import * as console from 'console'

export default class AuthController {
  public signup = async ({ view, request, session, response }: HttpContextContract) => {
    switch (request.method()) {
      case 'POST':
        const postSchema = schema.create({
          firstName: schema.string([rules.required(), rules.alpha(), rules.trim()]),
          lastName: schema.string([rules.required(), rules.alpha(), rules.trim()]),
          email: schema.string([rules.required(), rules.email(), rules.trim()]),
          password: schema.string([rules.required(), rules.trim(), rules.minLength(8)]),
        })

        const payload = await request.validate({
          schema: postSchema,
          messages: {
            'required': 'The {{ field }} is required',
            'alpha': 'The {{ field }} should contain alphabets required',
            'email.email': 'Please provide an email',
            'password.minLength': 'Password should be at least 8 charachters long',
          },
        })
        try {
          await User.createUser(payload)
          session.flash({
            success: 'User created',
          })
        } catch (error) {
          session.flash({ error: error.message })
          return response.redirect().back()
        }
        break
      default:
        const html = await view.render('auth/signup')
        return html
    }
  }
  public login = async ({ view, auth, request, session, response }: HttpContextContract) => {
    switch (request.method()) {
      case 'POST':
        const postSchema = schema.create({
          email: schema.string([rules.required(), rules.email(), rules.trim()]),
          password: schema.string([rules.required(), rules.trim(), rules.minLength(8)]),
        })

        const payload = await request.validate({
          schema: postSchema,
          messages: {
            'required': 'The {{ field }} is required',
            'alpha': 'The {{ field }} should contain alphabets required',
            'email.email': 'Please provide an email',
            'password.minLength': 'Password should be at least 8 charachters long',
          },
        })
        try {
          await auth.use('web').attempt(payload.email, payload.password)
          session.flash({
            success: 'Logged in ',
          })
          return response.redirect().toRoute('home')
        } catch (error) {
          session.flash({ error: error.message })
          return response.redirect().back()
        }
      default:
        const html = await view.render('auth/login')
        return html
    }
  }
  public logout = async ({ auth, session, response }: HttpContextContract) => {
    try {
      await auth.use('web').logout()
      session.flash({ success: 'Logged out' })
      return response.redirect().toRoute('AuthController.signup')
    } catch (error) {
      session.flash({ error: error.message })
      return response.redirect().back()
    }
  }
  public googleRedirect = async ({ ally }: HttpContextContract) => {
    return ally.use('google').redirect()
  }
  public googleCallback = async ({ ally, auth, session, response }: HttpContextContract) => {
    const google = ally.use('google')

    if (google.accessDenied()) {
      session.flash({ error: 'Access denied' })
      return response.redirect().toRoute('login')
    }

    if (google.stateMisMatch()) {
      session.flash({ error: 'Request expired. Retry again' })
      return response.redirect().toRoute('login')
    }

    if (google.hasError()) {
      session.flash({ error: google.getError()! })
      return response.redirect().toRoute('login')
    }
    const authUser = await google.user()

    try {
      const user = await User.CreateOrFindOAuthUser({
        email: authUser.email!,
        firstName: authUser.original.given_name,
        lastName: authUser.original.family_name,
        avatarUrl: authUser.avatarUrl ? authUser.avatarUrl : undefined,
        socialAuth: 'google',
      })

      await auth.use('web').login(user)
      session.flash({ success: 'Logged In' })
      return response.redirect().toRoute('home')
    } catch (error) {
      session.flash({ error: error.message })
      return response.redirect().toRoute('login')
    }
  }
  public githubRedirect = async ({ ally }: HttpContextContract) => {
    return ally.use('github').redirect()
  }
  public githubCallback = async ({ ally, auth, session, response }: HttpContextContract) => {
    const github = ally.use('github')

    if (github.accessDenied()) {
      session.flash({ error: 'Access denied' })
      return response.redirect().toRoute('login')
    }

    if (github.stateMisMatch()) {
      session.flash({ error: 'Request expired. Retry again' })
      return response.redirect().toRoute('login')
    }

    if (github.hasError()) {
      session.flash({ error: github.getError()! })
      return response.redirect().toRoute('login')
    }
    const authUser = await github.user()
    try {
      const user = await User.CreateOrFindOAuthUser({
        email: authUser.email!,
        firstName: authUser.name.split('')[0],
        lastName: authUser.name.split('')[1],
        avatarUrl: authUser.avatarUrl ? authUser.avatarUrl : undefined,
        socialAuth: 'github',
      })

      await auth.use('web').login(user)
      session.flash({ success: 'Logged In' })
      return response.redirect().toRoute('home')
    } catch (error) {
      session.flash({ error: error.message })
      return response.redirect().toRoute('login')
    }
  }
}
