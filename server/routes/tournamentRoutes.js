const router = require('express').Router()
const tournamentController = require('../controllers/tournaments')

router.get('/', ...tournamentController.getTournamentsHandler)
router.get('/:id/matchups', ...tournamentController.getMatchupsHandler)

router.post('/', ...tournamentController.createTournamentHandler)
router.post('/:id/entrant', ...tournamentController.joinTournamentHandler)
router.post('/:id/activation', ...tournamentController.activateTournamentHandler)

router.delete('/:id', ...tournamentController.cancelTournamentHandler)
router.delete('/:id/entrant', ...tournamentController.leaveTournamentHandler)

if (process.ENV !== 'production') {
  router.post('/:id/joinforce', ...tournamentController.forceAllJoinHandler)
}

module.exports = router