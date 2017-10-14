const logger = require('../logging/logger')

const getCurrentUserHandler = [
  (req, res) => {
    const {user, token} = res.locals
    logger.info(user, token)
    res.send(user)
  }
]

module.exports = {
  getCurrentUserHandler
}