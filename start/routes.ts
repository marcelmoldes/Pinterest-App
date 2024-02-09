import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async ({ view }) => {
  return view.render('welcome')
}).as('home')

Route.route('/signup', ['GET', 'POST'], 'AuthController.signup')
Route.route('/login', ['GET', 'POST'], 'AuthController.login')
