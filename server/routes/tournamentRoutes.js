const router = require('express').Router()
const tournamentController = require('../controllers/tournaments')

router.get('/', ...tournamentController.getTournamentsHandler)
router.post('/', ...tournamentController.createTournamentHandler)
router.post('/:id/entrant', ...tournamentController.joinTournamentHandler)
router.delete('/:id/entrant', ...tournamentController.leaveTournamentHandler)

module.exports = router