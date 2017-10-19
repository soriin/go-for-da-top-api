const router = require('express').Router()
const songController = require('../controllers/songs')

router.get('/', ...songController.getAllHandler)

router.post('/', ...songController.createHandler)

//router.put('/:id', ...songController.updateHandler)

//router.delete('/:id', ...songController.deleteHandler)

module.exports = router