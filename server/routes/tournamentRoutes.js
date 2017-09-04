const router = require('express').Router()
const tournamentController = require('../controllers/tournaments')

router.get('/', ...tournamentController.getTournamentsHandler)
router.post('/', ...tournamentController.createTournamentHandler)

module.exports = router