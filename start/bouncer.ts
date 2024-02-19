/**
 * Contract source: https://git.io/Jte3T
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import Bouncer from '@ioc:Adonis/Addons/Bouncer'

/*
|--------------------------------------------------------------------------
| Bouncer Actions
|--------------------------------------------------------------------------
|
| Actions allows you to separate your application business logic from the
| authorization logic. Feel free to make use of policies when you find
| yourself creating too many actions
|
| You can define an action using the `.define` method on the Bouncer object
| as shown in the following example
|
| ```
| 	Bouncer.define('deletePost', (user: User, post: Post) => {
|			return post.user_id === user.id
| 	})
| ```
|
|****************************************************************
| NOTE: Always export the "actions" const from this file
|****************************************************************
*/
export const { actions } = Bouncer

export const { policies } = Bouncer.registerPolicies({
  ProfilePolicy: () => import('App/Policies/ProfilePolicy'),
  PostPolicy: () => import('App/Policies/PostPolicy'),
})
