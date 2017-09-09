const router = require('express').Router()
const tournamentController = require('../controllers/tournaments')

router.get('/', ...tournamentController.getTournamentsHandler)
router.post('/', ...tournamentController.createTournamentHandler)
router.delete('/:id', ...tournamentController.cancelTournamentHandler)
router.post('/:id/entrant', ...tournamentController.joinTournamentHandler)
router.delete('/:id/entrant', ...tournamentController.leaveTournamentHandler)
router.post('/:id/activation', ...tournamentController.activateTournamentHandler)

module.exports = router