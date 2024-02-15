import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PostCreateValidator from 'App/Validators/PostCreateValidator'
import { cuid } from '@ioc:Adonis/Core/Helpers'
import Post from 'App/Models/Post'
import path from 'path'
import Database from '@ioc:Adonis/Lucid/Database'
import Env from '@ioc:Adonis/Core/Env'
export default class PostsController {
  public index = async ({ view }: HttpContextContract) => {
    const html = await view.render('posts/index')
    return html
  }

  public create = async ({ view }: HttpContextContract) => {
    const html = await view.render('posts/create')
    return html
  }
  public store = async ({ request, session, auth, response }: HttpContextContract) => {
    const payload = await request.validate(PostCreateValidator)
    const userDir = auth.user!.id
    const newImageName = `${cuid()}.${payload.postImage.extname}`
    const storagePrefix = path.posix.join(userDir.toString(), newImageName)
    const trx = await Database.transaction()
    try {
      await Post.create(
        {
          description: payload.description,
          storage_prefix: storagePrefix,
          tags: payload.tags,
          title: payload.title,
          user_id: auth.user!.id,
        },
        { trx }
      )
      await payload.postImage.moveToDisk(
        userDir.toString(),
        { name: newImageName },
        Env.get('DRIVE_DISK')
      )
      await trx.commit()

      session.flash({ success: 'Post Created' })
      return response.redirect().toRoute('posts.index')
    } catch (error) {
      await trx.rollback()
      console.error(error)
      session.flash({ error: error.message })
      return response.redirect().back()
    }
  }
}
