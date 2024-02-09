import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
export default class Profile extends BaseModel {
  @column({ isPrimary: true })
  public id: number
  @column()
  public first_name: string
  @column()
  public last_name: string
  @column()
  public full_name: string

  @column()
  public storage_prefix: string | null

  @column()
  public avatar_url: string | null

  @column()
  public social_auth: 'google' | 'github' | 'facebook' | 'local'

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
  public author: BelongsTo<typeof User>

  public static updateOrCreateProfile = async (
    data: updateOrCreateProfileType,
    trx: TransactionClientContract
  ) => {
    let queryString = {}
    await this.updateOrCreate(
      queryString,
      {
        first_name: data.firstName,
        last_name: data.lastName,
        user_id: data.userId,
        full_name: `${data.firstName} ${data.lastName}`,
      },
      {
        client: trx,
      }
    )
    return 'Profile created'
  }
}
