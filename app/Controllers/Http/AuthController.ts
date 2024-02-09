import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

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
}
