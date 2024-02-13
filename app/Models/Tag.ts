import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'

export default class Tag extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public title: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  public static storeTag = async (tags: string[], trx: TransactionClientContract) => {
    const tagIds: number[] = []
    for (const tag of tags) {
      const exists = await this.findBy('title', tag, { client: trx })
      if (exists) {
        if (!tagIds.includes(exists.id)) {
          tagIds.push(exists.id)
        }
      } else {
        const createdTag = await this.create(
          {
            title: tag,
          },
          { client: trx }
        )
        if (!tagIds.includes(createdTag.id)) {
          tagIds.push(createdTag.id)
        }
      }
    }

    return Promise.resolve(tagIds)
  }
}
