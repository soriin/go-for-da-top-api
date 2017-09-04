const passport = require('passport');
const User = require('../models/user');

const facebookHandler = [passport.authenticate('facebook')];

const facebookReturnHandler = [
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function (req, res) {
    res.cookie('gfdt_access_token_id', req.user.accessToken)
    res.cookie('gfdt_access_token_userid', req.user.profile.id)
    res.cookie('gfdt_access_token_user', req.user.profile)

    User.findOne({ facebookId: req.user.profile.id })
      .then((dbUser) => {
        if (dbUser) {
          dbUser.accessToken = req.user.accessToken;
          console.log('updated user', dbUser)
          return dbUser.save();
        } else {
          let newUser = new User();
          newUser.accessToken = req.user.accessToken;
          newUser.facebookId = req.user.profile.id;
          newUser.realName = req.user.profile.displayName;
          console.log('added new user', req.user)
          return newUser.save()
        }
      })
      .then(() => {
        res.redirect(process.env.clientRootUrl);
      })
  }
]

module.exports = {
  facebookHandler,
  facebookReturnHandler
}