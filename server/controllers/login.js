const passport = require('passport')
const User = require('../models/user')
const logger = require('../logging/logger')

const facebookHandler = [passport.authenticate('facebook')];

const facebookReturnHandler = [
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  async function facebookReturnFunc (req, res) {
    res.cookie('gfdt_access_token_id', req.user.accessToken)

    const dbUser = await User.findOne({ facebookId: req.user.profile.id }).exec()

    if (dbUser) {
      dbUser.accessToken = req.user.accessToken
      logger.info('updated user', dbUser)
      await dbUser.save()
    } else {
      let newUser = new User()
      newUser.accessToken = req.user.accessToken
      newUser.facebookId = req.user.profile.id
      newUser.realName = req.user.profile.displayName
      newUser.displayName = req.user.profile.displayName
      logger.info('added new user', req.user)
      await newUser.save()
    }
    res.redirect(process.env.clientRootUrl)
  }
]

module.exports = {
  facebookHandler,
  facebookReturnHandler
}