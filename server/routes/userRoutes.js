const router = require('express').Router()
const userController = require('../controllers/users')

router.get('/me', ...userController.getCurrentUserHandler)

module.exports = router