import { CustomMessages, rules, schema } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateTaskValidator {
  public schema = schema.create({
    firstName: schema.string.optional([rules.alpha(), rules.trim()]),
    lastName: schema.string.optional([rules.alpha(), rules.trim()]),
    password: schema.string.optional([ rules.minLength(8), rules.trim()]),
    postImage: schema.file.optional( {
      size: '2mb',
      extnames: ['jpg', 'png'],
    })


  })
  public messages: CustomMessages = {
    'fistName.alpha': 'First Name only alphabets',
    'lastName.alpha': 'Last Name only alphabets',
    'password.minLength': 'Password only must contain 8 long',
    'postImage.size': 'Image side not be greater than 2md',
    'postImage.extnames': 'Image only can be jpg or png',
  }
  constructor(protected ctx: HttpContextContract) {}
}
