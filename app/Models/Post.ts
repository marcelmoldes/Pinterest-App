import { DateTime } from 'luxon'
import {
  BaseModel,
  manyToMany,
  ManyToMany,
  column,
  belongsTo,
  BelongsTo,
} from '@ioc:Adonis/Lucid/Orm'
import Tag from 'App/Models/Tag'
import User from 'App/Models/User'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import ImageReadService from 'App/Services/ImageReadService'
export default class Post extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ isPrimary: true })
  public title: string

  @column({ isPrimary: true })
  public description: string

  @column({ isPrimary: true })
  public storage_prefix: string

  @column()
  public user_id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'user_id',
  })
  public user: BelongsTo<typeof User>

  @manyToMany(() => Tag, {
    pivotTable: 'tag_posts',
    localKey: 'id',
    pivotForeignKey: 'post_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'tag_id',
  })
  public tags: ManyToMany<typeof Tag>

  public static storePost = async (data: StorePostType, trx: TransactionClientContract) => {
    const post = await this.create(
      {
        title: data.title,
        description: data.description,
        storage_prefix: data.storagePrefix,
        user_id: data.userId,
      },
      {
        client: trx,
      }
    )
    const createdTagIds = await Tag.storeTag(data.tags, trx)
    await post.related('tags').attach(createdTagIds)
    return Promise.resolve('Post created')
  }
  public static getPostById = async (postId: number) => {
    let post = await this.query()
      .where('id', postId)
      .preload('user', (userQuery) => {
        userQuery.preload('profile')
      })
      .preload('tags')
      .firstOrFail()

    post = await ImageReadService.readSingleImage(post)
    return Promise.resolve(post)
  }
  public static updatePost = async (data: UpdatePostType, trx: TransactionClientContract) => {
    let post = await this.query({ client: trx }).where('id', data.id).firstOrFail()
    if (!post) {
      return Promise.reject(new Error('Post not found'))
    }
    if (data.title) {
      post.title = data.title
    }
    if (data.description) {
      post.description = data.description
    }
    if (data.storagePrefix) {
      post.storage_prefix = data.storagePrefix
    }
    const tagIds = await Tag.storeTag(data.tags, trx)
    await post.related('tags').sync(tagIds)
    await post.save()
    return Promise.resolve('Post updated')
  }
}
