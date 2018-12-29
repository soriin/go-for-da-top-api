const Tournament = require('../models/tournament')
const User = require('../models/user')
const Matchup = require('../models/matchup')
const moment = require('moment')
const logger = require('../logging/logger')
const tournamentSvc = require('../services/tournamentService')
const mongooseTypes = require('mongoose').Types

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

      const tournament = await Tournament.findOneAndUpdate(
        { _id: tournamentId, isActive: false },
        { $addToSet: { entrants: userId } },
        { new: true })
        .exec()
      if (!tournament) {
        logger.info(`${userId} unable to join tournament ${tournamentId}`)
        return res.status(404).end()
      }
      res.send(tournament)
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

      const tournament = await Tournament.findOneAndUpdate(
        { _id: tournamentId, isActive: false },
        { $pull: { entrants: userId } },
        { new: true })
        .exec()
      if (!tournament) {
        logger.info(`${userId} unable to leave tournament ${tournamentId}`)
        return res.send({ tournamentId, userId })
      }
      res.send(tournament)
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
        { new: true })
        .lean()
        .exec()

      res.send(result)
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
        'players.user': userId
      }).lean().exec()

      matchups.forEach(match => {
        const showEntries = moment(match.endDate) <= moment() && match.verification
        
        if (!showEntries) {
          match.battles.forEach(battle => {
            battle.entries = {}
          })
          match.players.forEach(player => {
            player.score = undefined
          })
        }
        
      })

      res.send({ matchups, count: matchups.length })
    } catch (e) {
      logger.error(e)
      res.status(500).send({ error: 'unable to retrieve matchups' })
    }
  }
]

const getVerifiableMatchupsHandler = [
  async function getVerifiableMatchupsFunc(req, res) {
    try {
      const tournamentId = req.params.id
      const userId = req.query.userId
      const dateTimeNow = moment().toDate()
      logger.info(`getting matchups that need to be verified for tournament ${tournamentId} for user ${userId}`)

      const matchups = await Matchup.find({
        tournament: tournamentId,
        'endDate': {'$lt': dateTimeNow}
      }).lean().exec()

      res.send({ matchups, count: matchups.length })
    } catch (e) {
      logger.error(e)
      res.status(500).send({ error: 'unable to retrieve matchups' })
    }
  }
]

const getStandingsHandler = [
  async function getStandingsFunc(req, res) {
    try {
      const tournamentId = req.params.id
      logger.info(`getting standings for tournament ${tournamentId}`)

      const standings = await Matchup.aggregate([
        {'$match': {tournament: mongooseTypes.ObjectId(tournamentId)}}
        ,{'$unwind': '$players'}
        ,{'$replaceRoot': {newRoot: '$players'}}
        ,{'$group': {_id: '$user', score: {'$sum': '$score'}}}
        ,{'$lookup': { from: 'users', localField: '_id', foreignField: '_id', as: 'user' }}
        ,{'$unwind': '$user'}
        ,{'$project': {'displayName': '$user.displayName', 'score': 1}}
        ,{'$sort': {'score': -1}}
      ])
      .exec()

      res.send(standings)
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
  getStandingsHandler,
  getVerifiableMatchupsHandler,
}