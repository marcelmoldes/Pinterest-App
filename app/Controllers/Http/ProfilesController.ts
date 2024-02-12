 import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Profile from "App/Models/Profile";
import ProfileUpdateValidator from "App/Validators/ProfileUpdateValidator"
import {cuid}  from '@ioc:Adonis/Core/Helpers'
 import  path from "path";
import Database from '@ioc:Adonis/Lucid/Database'
 import Env from '@ioc:Adonis/Core/Env'
 import Drive from '@ioc:Adonis/Core/Drive'
export default class ProfilesController {
  public show = async ({view, session, params, response}: HttpContextContract) => {
    const {id} = params

    try {
      const profile = await Profile.getProfileById(id)
      let imgBase64 = ''
      if(profile.storage_prefix) {
       imgBase64 = (await Drive.get(profile.storage_prefix)).toString('base64')
      }

      const html = await view.render('profiles/show', {profile,imgBase64})
      return html
    } catch (error) {
      console.error(error)
      session.flash({error: error.message})
      return response.redirect().toRoute('home')
    }
  }
  public edit = async ({view, session, params, response}: HttpContextContract) => {
    const {id} = params

    try {
      const profile = await Profile.getProfileById(id)
      let imgBase64 = ''
      if(profile.storage_prefix) {
        imgBase64 = (await Drive.get(profile.storage_prefix)).toString('base64')
      }

      const html = await view.render('profiles/edit', {profile,imgBase64})
      return html
    } catch (error) {
      console.error(error)
      session.flash({error: error.message})
      return response.redirect().toRoute('home')
    }
  }

  public update = async ({auth, session, request, params, response}: HttpContextContract) => {
    const {id} = params
    const payload = await request.validate(ProfileUpdateValidator)
    console.log(payload)
    let profile: Profile
    try {
      profile = await Profile.findOrFail(id)

    } catch (error) {
      console.error(error)
      session.flash({error: 'Profile not found'})
      return response.redirect().toRoute('home')
    }
    let userDir: auth.user.id
    let storagePrefix = ''
    let newImageName = ''

    if (payload.postImage) {
      newImageName = `${cuid()}.${payload.postImage.extname}`
      storagePrefix = path.posix.join(userDir, newImageName)
    }
    const trx = await Database.transaction()

    try {
      await Profile.updateProfile({id,storagePrefix,...payload}, trx)
      if (payload.postImage) {
        await payload.postImage.moveToDisk(
          userDir.toString(), {name: newImageName}, Env.get('DRIVE_DISK')
        )
        if (profile.storage_prefix) {

          await Drive.delete(profile.storage_prefix)
        }
      }
      await trx.commit()
    } catch (error) {
      await trx.rollback()
      const uploaded = await Drive.exists(storagePrefix)
if(uploaded) {
await Drive.delete(storagePrefix)
}
console.error(error)
      session.flash({error:error.message})
      return response.redirect().toRoute('profile.show',{id})
    }
    if(payload.password) {
      session.flash({success:'Logged Out'})
      return response.redirect().toRoute('logout')
    } else {
      session.flash({success:'Profile Updated'})
      return response.redirect().toRoute('profile.show',{id})
    }



  }
}


