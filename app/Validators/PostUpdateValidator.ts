import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PostCreateValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    title: schema.string.optional([rules.maxLength(50)]),
    description: schema.string.optional([rules.maxLength(400)]),
    postImage: schema.file.optional({
      size: '2mb',
      extnames: ['jpg', 'png'],
    }),
  })

  public messages: CustomMessages = {
    'title.maxLength': 'Title can not be 50 long',
    'description.maxLength': 'Description can not be 50 long',
    'postImage.size': 'Image side not be greater than 2md',
    'postImage.extnames': 'Image only can be jpg or png',
  }
}
