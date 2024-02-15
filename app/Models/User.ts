import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import {
  BaseModel,
  beforeSave,
  HasMany,
  hasOne,
  hasMany,
  HasOne,
  column,
} from '@ioc:Adonis/Lucid/Orm'
import Profile from 'App/Models/Profile'
import Database from '@ioc:Adonis/Lucid/Database'
import * as console from 'console'
import Post from 'App/Models/Post'
import S3ReadService from 'App/Services/S3ReadService'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number
  @column()
  public email: string

  @column()
  public password: string | null

  @column()
  public remember_me_token: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasOne(() => Profile, {
    localKey: 'id',
    foreignKey: 'user_id',
  })
  public profile: HasOne<typeof Profile>

  @hasMany(() => Post, {
    foreignKey: 'user_id',
  })
  public posts: HasMany<typeof Post>

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password && user.password) {
      user.password = await Hash.make(user.password)
    }
  }

  public static createUser = async (data: CreateUserType) => {
    const trx = await Database.transaction()

    const exists = await this.findBy('email', data.email)
    if (exists) {
      throw new Error('User already exists with this email')
    }

    try {
      const createdUser = await this.create(
        {
          email: data.email,
          password: data.password,
        },
        {
          client: trx,
        }
      )
      await Profile.updateOrCreateProfile(
        {
          firstName: data.firstName,
          lastName: data.lastName,
          userId: createdUser.id,
        },
        trx
      )
      await trx.commit()
    } catch (error) {
      await trx.rollback()
      console.error(error)
      return Promise.reject(error)
    }
  }
  public static CreateOrFindOAuthUser = async (data: CreateOrFindOAuthUserType) => {
    let user = await this.query().where('email', data.email).preload('profile').first()

    if (user) {
      if (user.profile.social_auth !== data.socialAuth) {
        return Promise.resolve(user)
      }
    } else {
      const trx = await Database.transaction()
      try {
        user = await this.create(
          {
            email: data.email,
          },
          {
            client: trx,
          }
        )
        await Profile.create(
          {
            first_name: data.firstName,
            last_name: data.lastName,
            user_id: user.id,
            full_name: `${data.firstName} ${data.lastName}`,
            avatar_url: data.avatarUrl,
            social_auth: data.socialAuth,
          },
          { client: trx }
        )
        await trx.commit()
      } catch (error) {
        await trx.rollback()
        console.error(error)
        return Promise.reject(error)
      }
    }
    return Promise.resolve(user)
  }
  public static findPostsByUserId = async (userId: number) => {
    const user = await this.query().where('id', userId).preload('posts').firstOrFail()
    const posts = await S3ReadService.readMultipleImages(user.posts)
    return Promise.resolve(posts)
  }
}
