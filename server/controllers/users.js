const logger = require('../logging/logger')
const User = require('../models/user')

const massageUser = (dbUser) => {
  return {
    _id: dbUser._id,
      realName: dbUser.realName,
      displayName: dbUser.displayName,
      isAdmin: dbUser.isAdmin
  }
}

const getCurrentUserHandler = [
  (req, res) => {
    const {user, token} = res.locals
    logger.info(user, token)
    res.send(massageUser(user))
  }
]

const getUserHandler = [
  async (req, res) => {
    try {
      const userId = req.params.id
      logger.info(`getting user data for ${userId}`)
      const user = await User
        .findOne({
          _id: userId
        })
        .lean()
        .exec()
      
      res.send(massageUser(user))
    } catch (e) {
      logger.error(e.stack)
      res.status(500).send({ error: 'unable to retrieve user data' })
    }
  }
]

module.exports = {
  getCurrentUserHandler,
  getUserHandler
}