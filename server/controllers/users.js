const logger = require('../logging/logger')
const User = require('../models/user')
const sanitizeSvc = require('../services/sanitizeService')

const massageUser = (dbUser) => {
  return {
    _id: dbUser._id,
    realName: dbUser.realName,
    displayName: dbUser.displayName,
    isAdmin: dbUser.isAdmin,
    email: dbUser.email
  }
}

const getCurrentUserHandler = [
  (req, res) => {
    const { user, token } = res.locals
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

const updateUserHandler = [
  async (req, res) => {
    try {
      const userId = req.params.id
      logger.info(`getting user data for ${userId}`, req.body)
      if (res.locals.user._id.toString() !== userId) {
        logger.error('Unauthorized user edit attempted')
        return res.status(403).send({ error: 'unable to update user data' })
      }

      const validProperties = [
        'displayName',
        'realName',
        'email'
      ]
      const cleanedData = sanitizeSvc.sanitize(req.body, validProperties)
      const user = await User
        .findOneAndUpdate({
          _id: userId
        },
          cleanedData,
          { new: true }).exec()

      res.send(massageUser(user))
    } catch (e) {
      logger.error(e.stack)
      res.status(500).send({ error: 'unable to update user data' })
    }
  }
]

module.exports = {
  getCurrentUserHandler,
  getUserHandler,
  updateUserHandler
}