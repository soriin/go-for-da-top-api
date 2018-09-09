const router = require('express').Router()
const userController = require('../controllers/users')

router.get('/me', ...userController.getCurrentUserHandler)
router.get('/:id', ...userController.getUserHandler)

module.exports = router