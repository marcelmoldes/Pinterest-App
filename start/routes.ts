import Route from '@ioc:Adonis/Core/Route'

Route.get('/', 'HomeController.index').as('home')
Route.group(() => {
  Route.route('/signup', ['GET', 'POST'], 'AuthController.signup').as('signup')
  Route.get('/google/redirect', 'AuthController.googleRedirect').as('google.redirect')
  Route.get('/google/callback', 'AuthController.googleCallback').as('google.callback')
  Route.get('/github/redirect', 'AuthController.githubRedirect').as('github.redirect')
  Route.get('/github/callback', 'AuthController.githubCallback').as('github.callback')
}).middleware('isGuest')

Route.route('/login', ['GET', 'POST'], 'AuthController.login').as('login')
Route.get('/logout', 'AuthController.logout').as('logout').middleware('auth')

Route.resource('/profile', 'ProfilesController').only(['show', 'edit', 'update']).middleware({
  edit: 'auth',
  update: 'auth',
})
Route.resource('/posts', 'PostsController').middleware({
  index: 'auth',
  create: 'auth',
  store: 'auth',
  edit: 'auth',
  update: 'auth',
  destroy: 'auth',
})
Route.get('/posts/download/:id', 'PostsController.download').as('posts.download')
Route.get('/about', 'Posts')
