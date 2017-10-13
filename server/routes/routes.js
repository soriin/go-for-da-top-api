const router = require('express').Router()
const loginRoutes = require('./loginRoutes')
const tournamentRoutes = require('./tournamentRoutes')
const userRoutes = require('./userRoutes')
const matchupRoutes = require('./matchupRoutes')
const User = require('../models/user');

router.use('/login', loginRoutes)

const auth = async function auth(req, res, next) {
  try {
    const auth = req.headers['authorization'].split('Bearer ')[1];
    if (auth) {
      res.locals.token = auth;
      const user = await User.findOne({ accessToken: auth })

      if (user) {
        res.locals.user = user;
        next(null);
      } else {
        next('no user found')
      }
    }
  } catch (e) {
    console.error(e)
    next('auth failed');
  }
}

router.use(auth)
router.use('/users', userRoutes)
router.use('/tournaments', tournamentRoutes)
router.use('/matchups', matchupRoutes)

module.exports = router