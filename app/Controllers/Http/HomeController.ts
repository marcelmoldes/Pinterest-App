import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Post from 'App/Models/Post'
import S3ReadService from 'App/Services/S3ReadService'
export default class HomeController {
  public index = async ({ request, view, session, response }: HttpContextContract) => {
    const { search } = request.all()
    try {
      const fetchedPosts = await Post.query().if(
        typeof search === 'string' || search instanceof String,
        (queryBuilder) => {
          queryBuilder.where('title', 'like', `%${search}%`)
          queryBuilder.orWhere('description', 'like', `%${search}%`)
        }
      )
      const posts = await S3ReadService.readMultipleImages(fetchedPosts)
      const html = await view.render('welcome', { posts })
      return html
    } catch (error) {
      console.error(error)
      session.flash({ error: error.message })
      return response.redirect().back()
    }
  }
}
