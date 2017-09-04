const router = require('express').Router()
const tournamentController = require('../controllers/tournaments')

router.get('/', ...tournamentController.getTournamentsHandler)
router.post('/', ...tournamentController.createTournamentHandler)
router.post('/:id/entrant', ...tournamentController.joinTournamentHandler)

module.exports = router