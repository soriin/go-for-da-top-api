const router = require('express').Router()
const loginController = require('../controllers/login')

router.get('/facebook', ...loginController.facebookHandler)
router.get('/facebook/return', ...loginController.facebookReturnHandler)

module.exports = router