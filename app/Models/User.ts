import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { BaseModel, beforeSave, hasOne, HasOne, column } from '@ioc:Adonis/Lucid/Orm'
import Profile from 'App/Models/Profile'
import Database from '@ioc:Adonis/Lucid/Database'

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
}
