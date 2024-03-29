import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PostCreateValidator from 'App/Validators/PostCreateValidator'
import { cuid } from '@ioc:Adonis/Core/Helpers'
import PostUpdateValidator from 'App/Validators/PostUpdateValidator'
import path from 'path'
import Database from '@ioc:Adonis/Lucid/Database'
import Env from '@ioc:Adonis/Core/Env'
import User from 'App/Models/User'
import Post from 'App/Models/Post'
import TagPost from 'App/Models/TagPost'
import { extname } from 'path'
import Drive from '@ioc:Adonis/Core/Drive'
export default class PostsController {
  public index = async ({ view, auth, session, response }: HttpContextContract) => {
    try {
      const posts = await User.findPostsByUserId(auth.user!.id)
      const html = await view.render('posts/index', { posts })
      return html
    } catch (error) {
      console.error(error)
      session.flash({ error: error.message })
      return response.redirect().back()
    }
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
  public show = async ({ view, params, response, session }: HttpContextContract) => {
    const { id } = params
    try {
      const post = await Post.getPostById(id)
      const posts = await TagPost.findRelatedPost(
        post.tags.map((tag) => tag.id),
        id
      )
      const html = view.render('posts/show', { post, posts })
      return html
    } catch (error) {
      console.error(error)
      session.flash({ error: error.message })
      return response.redirect().toRoute('posts.index')
    }
  }

  public edit = async ({ session, bouncer, response, view, params }: HttpContextContract) => {
    const { id } = params
    try {
      const post = await Post.getPostById(id)
      await bouncer.with('PostPolicy').authorize('update', post)
      const html = await view.render('posts/edit', { post })
      return html
    } catch (error) {
      console.error(error)
      session.flash({ error: error.message })
      return response.redirect().toRoute('posts.index')
    }
  }
  public update = async ({
    session,
    bouncer,
    auth,
    response,
    params,
    request,
  }: HttpContextContract) => {
    const { id } = params
    const payload = await request.validate(PostUpdateValidator)
    let post: Post
    try {
      post = await Post.firstOrFail(id)
    } catch (error) {
      console.error(error)
      session.flash({ error: 'Post not found' })
      return response.redirect().toRoute('posts.index')
    }
    try {
      await bouncer.with('PostPolicy').authorize('update', post)
    } catch (error) {
      console.error(error)
      session.flash({ error: error.message })
      return response.redirect().toRoute('posts.index')
    }

    let userDir = auth.user!.id
    let storagePrefix
    let newImageName

    if (payload.postImage) {
      newImageName = `${cuid()}.${payload.postImage.extname}`
      storagePrefix = path.posix.join(userDir, newImageName)
    }
    const trx = await Database.transaction()

    try {
      const result = await Post.updatePost(
        {
          id,
          title: payload.title,
          description: payload.description,
          tags: payload.tags ? payload.tags : [],
          storagePrefix,
        },
        trx
      )

      if (payload.postImage) {
        await payload.postImage.moveToDisk(
          userDir.toString(),
          { name: newImageName },
          Env.get('DRIVE_DISK')
        )
        if (post.storage_prefix) {
          await Drive.delete(post.storage_prefix)
        }
      }
      await trx.commit()
      session.flash({ success: result })
      return response.redirect().toRoute('posts.show', { id })
    } catch (error) {
      await trx.rollback()

      const uploaded = await Drive.exists(storagePrefix)
      if (uploaded) {
        await Drive.delete(storagePrefix)
      }

      console.error(error)
      session.flash({ error: error.message })
      return response.redirect().toRoute('posts.index')
    }
  }
  public destroy = async ({ params, bouncer, response, session }: HttpContextContract) => {
    const { id } = params
    const trx = await Database.transaction()
    let post: Post
    try {
      post = await Post.firstOrFail(id, { client: trx })
    } catch (error) {
      console.error(error)
      session.flash({ error: 'Post not found' })
      return response.redirect().toRoute('posts.index')
    }
    try {
      await bouncer.with('PostPolicy').authorize('delete', post)
    } catch (error) {
      console.error(error)
      session.flash({ error: error.message })
      return response.redirect().toRoute('posts.index')
    }
    try {
      await post.delete()

      await Drive.delete(post.storage_prefix)
      await trx.commit()
      return response.redirect().toRoute('posts.index')
    } catch (error) {
      await trx.rollback()
      console.error(error)
      session.flash({ error: error.message })
      return response.redirect().toRoute('posts.index')
    }
  }
  public download = async ({ params, response, session }: HttpContextContract) => {
    const { id } = params
    let post: Post
    try {
      post = await Post.firstOrFail(id)
      const { size } = await Drive.getStats(post.storage_prefix)
      response.type(path.extname(post.storage_prefix))
      response.header('content-length', size)

      response.header(
        'content-disposition',
        `attachment; filename=${path.basename(post.storage_prefix)}`
      )
      return response.stream(await Drive.getStream(post.storage_prefix))
    } catch (error) {
      console.error(error)
      session.flash({ error: 'Post not found' })
      return response.redirect().toRoute('posts.index')
    }
  }
}
