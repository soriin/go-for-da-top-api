const Tournament = require('../models/tournament')
const moment = require('moment')

const getTournamentsHandler = [
  async function getTournamentsFunc(req, res) {
    const isActive = req.params.isActive || true
    const tournaments = await Tournament.find({ isActive: isActive }).exec()
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
      res.status(500).send({ error: 'unable to create tournament' })
    }
  }
]

const joinTournamentHandler = [
  async function joinTournamentFunc(req, res) {
    try {
      const tournamentId = req.params.id
      const userId = res.locals.user._id
      console.log(`${userId} joining tournament ${tournamentId}`)

      const tournament = await Tournament.findOne({ _id: tournamentId, entrants: { $ne: userId } }).exec()
      if (!tournament) {
        console.log(`${userId} already in ${tournamentId} or don't exist`)
        return res.status(409).send()
      }
      tournament.entrants.push(userId)
      const savedTournament = await tournament.save()
      res.send({tournamentId: savedTournament._id, userId: userId})
    } catch (e) {
      console.error(e)
      res.status(500).send({ error: 'unable to join tournament' })
    }
  }
]

const leaveTournamentHandler = [
  async function leaveTournamentFunc(req, res) {
    try {
      const tournamentId = req.params.id
      const userId = res.locals.user._id
      console.log(`${userId} leaving tournament ${tournamentId}`)

      const tournament = await Tournament.findOne({ _id: tournamentId, entrants: { $eq: userId } }).exec()
      if (!tournament || !tournament.entrants) {
        console.log(`${userId} already not in ${tournamentId} or don't exist`)
        res.send({tournamentId: tournamentId, userId: userId})
      }
      tournament.entrants.pull(userId)
      const savedTournament = await tournament.save()
      res.send({tournamentId: savedTournament._id, userId: userId})
    } catch (e) {
      console.error(e)
      res.status(500).send({ error: 'unable to leave tournament' })
    }
  }
]

module.exports = {
  getTournamentsHandler,
  createTournamentHandler,
  joinTournamentHandler,
  leaveTournamentHandler,
}