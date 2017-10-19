const Tournament = require('../models/tournament')
const User = require('../models/user')
const Matchup = require('../models/matchup')
const moment = require('moment')
const logger = require('../logging/logger')
const tournamentSvc = require('../services/tournamentService')

const getTournamentsHandler = [
  async function getTournamentsFunc(req, res) {
    try {
      const tournaments = await Tournament.find().exec()
      res.send(tournaments)
    } catch (e) {
      logger.error(e)
      res.status(500).send({ error: 'unable to retrieve tournaments' })
    }
  }
]

const createTournamentHandler = [
  async function createTournamentFunc(req, res) {
    try {
      logger.info('creating tournament', req.body)
      const userId = res.locals.user._id
      const body = req.body
      const newT = new Tournament()

      newT.title = body.title
      newT.weeks = body.weeks
      newT.startDate = moment(body.startDate).toDate()
      newT.endDate = moment(body.endDate).toDate()
      newT.creator = res.locals.user._id
      newT.isActive = false
      newT.organizers = [userId]

      const savedTournament = await newT.save()
      res.send(savedTournament)
    } catch (e) {
      logger.error(e)
      res.status(500).send({ error: 'unable to create tournament' })
    }
  }
]

const cancelTournamentHandler = [
  async function cancelTournamentFunc(req, res) {
    try {
      const tournamentId = req.params.id
      const userId = res.locals.user._id
      logger.info(`cancelling tournament ${tournamentId}`)

      const response = await Tournament.deleteOne({ _id: tournamentId, organizers: userId }).exec()
      if (!response.result.ok) {
        logger.error(`${userId} unable to cancel tournament ${tournamentId}`)
        return res.status(404).end()
      }
      res.send({ tournamentId, userId })
    } catch (e) {
      logger.error(e)
      res.status(500).send({ error: 'unable to cancel tournament' })
    }
  }
]

const joinTournamentHandler = [
  async function joinTournamentFunc(req, res) {
    try {
      const tournamentId = req.params.id
      const userId = res.locals.user._id
      logger.info(`${userId} joining tournament ${tournamentId}`)

      const result = await Tournament.update(
        { _id: tournamentId, isActive: false },
        { $addToSet: { entrants: userId } })
        .exec()
      if (!result.ok) {
        logger.info(`${userId} unable to join tournament ${tournamentId}`)
        return res.status(404).end()
      }
      res.send({ tournamentId, userId })
    } catch (e) {
      logger.error(e)
      res.status(500).send({ error: 'unable to join tournament' })
    }
  }
]

const leaveTournamentHandler = [
  async function leaveTournamentFunc(req, res) {
    try {
      const tournamentId = req.params.id
      const userId = res.locals.user._id
      logger.info(`${userId} leaving tournament ${tournamentId}`)

      const result = await Tournament.update(
        { _id: tournamentId, isActive: false },
        { $pull: { entrants: userId } })
        .exec()
      if (!result.ok) {
        logger.info(`${userId} unable to leave tournament ${tournamentId}`)
        return res.send({ tournamentId, userId })
      }
      res.send({ tournamentId, userId })
    } catch (e) {
      logger.error(e)
      res.status(500).send({ error: 'unable to leave tournament' })
    }
  }
]

const activateTournamentHandler = [
  async function activateTournamentFunc(req, res) {
    try {
      const tournamentId = req.params.id
      const userId = res.locals.user._id
      logger.info(`${userId} activating tournament ${tournamentId}`)
      const tournament = await Tournament.findOneAndUpdate(
        { _id: tournamentId, isActive: false, organizers: userId },
        { isActive: true },
        { new: true })
        .exec()

      if (!tournament) {
        return res.status(404).end()
      }

      tournamentSvc.createEntries(tournament)

      res.send(tournament)
    } catch (e) {
      logger.error(e)
      res.status(500).send({ error: 'unable to activate tournament' })
    }
  }
]

const forceAllJoinHandler = [
  async function forceAllJoinFunc(req, res) {
    try {
      const tournamentId = req.params.id
      logger.info(`forcing all users to join tournament ${tournamentId}`)

      const userIds = await User.find().select({ _id: 1 }).lean().exec()
      const result = await Tournament.update(
        { _id: tournamentId, isActive: false },
        { $addToSet: { entrants: { $each: userIds } } },
        {new: true})
        .lean()
        .exec()

      res.send(result )
    } catch (e) {
      logger.error(e)
      res.status(500).send({ error: 'unable to for joins' })
    }
  }
]

const getMatchupsHandler = [
  async function getMatchupsFunc(req, res) {
    try {
      const tournamentId = req.params.id
      const userId = req.query.userId
      logger.info(`getting matchups for tournament ${tournamentId} and user ${userId}`)

      const matchups = await Matchup.find({
        tournament: tournamentId,
        $or: [
          { 'player1.user': userId },
          { 'player2.user': userId }
        ]
      }).lean().exec()

      res.send({ matchups, count: matchups.length })
    } catch (e) {
      logger.error(e)
      res.status(500).send({ error: 'unable to retrieve matchups' })
    }
  }
]

module.exports = {
  getTournamentsHandler,
  createTournamentHandler,
  joinTournamentHandler,
  leaveTournamentHandler,
  activateTournamentHandler,
  cancelTournamentHandler,
  forceAllJoinHandler,
  getMatchupsHandler,
}