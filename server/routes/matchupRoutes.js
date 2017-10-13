const router = require('express').Router()
const matchupController = require('../controllers/matchups')

router.get('/', ...matchupController.getMatchupsHandler)

router.put('/:id', ...matchupController.updateMatchupHandler)

router.post('/:id/verification', ...matchupController.verifyMatchupHandler)
router.post('/:id/submission', ...matchupController.submitEntryMatchupHandler)

router.delete('/:id/verification', ...matchupController.unverifyMatchupHandler)

module.exports = router