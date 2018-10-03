const router = require('express').Router()
const userController = require('../controllers/users')

router.get('/me', ...userController.getCurrentUserHandler)
router.get('/:id', ...userController.getUserHandler)

router.put('/:id', ...userController.updateUserHandler)

module.exports = router