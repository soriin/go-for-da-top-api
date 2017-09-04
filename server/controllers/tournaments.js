const Tournament = require('../models/tournament')
const moment = require('moment')

const getTournamentsHandler = [
  async function getTournamentsFunc(req, res) {
    const tournaments = await Tournament.find({ isActive: true })
    res.send(tournaments)
  }
]

const createTournamentHandler = [
  async function createTournamentFunc(req, res) {
    try {
      console.log('creating tournament', req.body)
      const body = req.body
      const newT = new Tournament()
      newT.title = body.title
      newT.startDate = moment(body.startDate).toDate()
      newT.endDate = moment(body.endDate).toDate()
      newT.creator = res.locals.user._id
      newT.isActive = true
  
      const savedTournament = await newT.save()
      res.send(savedTournament)
    } catch (e) {
      console.error(e)
      res.status(500).send({error: 'unable to create tournament'})
    }
  }
]

const joinTournamentHandler = [
  async function joinTournamentFunc(req, res) {
    try {
      console.log('joining tournament', req.body)
      const body = req.body
      const tournamentId = body.tournamentId
      const userId = res.locals.user._id

      const tournament = await Tournament.find({_id: tournamentId})
    } catch (e) {
      console.error(e)
      res.status(500).send({error: 'unable to join tournament'})
    }
  }
]

module.exports = {
  getTournamentsHandler,
  createTournamentHandler
}