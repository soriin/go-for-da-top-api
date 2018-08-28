const logger = require('../logging/logger')

const getCurrentUserHandler = [
  (req, res) => {
    const {user, token} = res.locals
    logger.info(user, token)
    res.send({
      _id: user._id,
      realName: user.realName,
      displayName: user.displayName,
      isAdmin: user.isAdmin
    })
  }
]

module.exports = {
  getCurrentUserHandler
}