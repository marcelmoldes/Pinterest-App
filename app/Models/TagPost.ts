import { DateTime } from 'luxon'
import {BaseModel, BelongsTo, belongsTo, column} from '@ioc:Adonis/Lucid/Orm'
import Post from "App/Models/Post";

export default class TagPost extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public post_id: number

  @column()
  public tag_id: number
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Post,{
    localKey: 'id',
    foreignKey:'post_id',
  })
  public post: BelongsTo<typeof Post>
}
