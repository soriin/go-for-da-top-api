const Tournament = require('../models/tournament')
const UserRole = require('../models/userRole')
const moment = require('moment')
const logger = require('../logging/logger')

const getTournamentsHandler = [
  async function getTournamentsFunc(req, res) {
    let isActive = req.params.isActive
    if (isActive === undefined) isActive = false
    const tournaments = await Tournament.find({ isActive: isActive }).exec()
    res.send(tournaments)
  }
]

const createTournamentHandler = [
  async function createTournamentFunc(req, res) {
    const userId = res.locals.user._id
    let savedTournament
    try {
      logger.info('creating tournament', req.body)
      const body = req.body
      const newT = new Tournament()
      newT.title = body.title
      newT.startDate = moment(body.startDate).toDate()
      newT.endDate = moment(body.endDate).toDate()
      newT.creator = res.locals.user._id
      newT.isActive = false

      savedTournament = await newT.save()
    } catch (e) {
      logger.error(e)
      res.status(500).send({ error: 'unable to create tournament' })
    }
    try {
       await UserRole.update(
         {userId: userId, tournamentId: savedTournament._id},
        {role: 'TO'},
        {upsert: true})
        .exec()
    } catch (e) {
      logger.warn(`unable to create TO role for ${userId}`)
    }

    res.send(savedTournament)
  }
]

const cancelTournamentHandler = [
  async function cancelTournamentFunc(req, res) {
    try {
      const tournamentId = req.params.id
      const userId = res.locals.user._id
      logger.info(`cancelling tournament ${tournamentId}`)

      const isAllowedResult = await UserRole.count({tournamentId, userId, role: 'TO'}).exec()

      if (isAllowedResult !== 1) {
        logger.info(`${userId} not allowed to cancel tournament ${tournamentId}`)
        return res.status(403).send()
      }
      const response = await Tournament.deleteOne({_id: tournamentId}).exec()
      if (!response.result.ok) {
        logger.error(`${userId} unable to cancel tournament ${tournamentId}`)
        return res.status(404).send()
      }
      await UserRole.deleteMany({tournamentId}).exec()
      res.send({tournamentId, userId})
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
        { _id: tournamentId, isActive: false, entrants: { $ne: userId } },
        {$addToSet: {entrants: userId}})
        .exec()
      if (!result.ok) {
        logger.info(`${userId} unable to join tournament ${tournamentId}`)
        return res.status(404).send()
      }
      res.send({tournamentId, userId})
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
        { _id: tournamentId, isActive: false, entrants: { $ne: userId } },
        {$pull: {entrants: userId}})
        .exec()
      if (!result.ok) {
        logger.info(`${userId} unable to leave tournament ${tournamentId}`)
        return res.send({tournamentId, userId})
      }
      res.send({tournamentId, userId})
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
        {_id: tournamentId, isActive: false},
        {isActive: true},
        {new: true})
        .exec()
      res.send(tournament)
    } catch (e) {
      logger.error(e)
      res.status(500).send({ error: 'unable to activate tournament' })
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
}