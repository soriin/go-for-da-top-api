const Matchup = require('../models/matchup')
const logger = require('../logging/logger')
const moment = require('moment')
const matchupSvc = require('../services/matchupService')

const authMatchupAdmin = async function authMatchupAdminFunc(req, res, next) {

  const matchupId = req.params.id
  const userId = res.locals.user._id
  logger.info(`ensuring user ${userId} has admin privs on matchup ${matchupId}`)

  const isAdmin = await matchupSvc.hasAdminPrivs(matchupId, userId)

  if (!isAdmin) {
    logger.warn(`user ${userId} does not have admin privs on matchup ${matchupId}`)
    return res.status(404).end()
  }
  next()
}

const getMatchupsHandler = [
  async function getMatchupsFunc(req, res) {
    try {
      const userId = res.locals.user._id
      logger.info(`getting matchups for user ${userId}`)
      const matchups = await Matchup
        .find({
          battles: {
            $elemMatch: {
              entries: {
                $elemMatch: {
                  player: userId
                }
              }
            }
          }
        })
        .lean()
        .exec()
      res.send({ matchups, count: matchups.length })
    } catch (e) {
      logger.error(e)
      res.status(500).send({ error: 'unable to retrieve matchups' })
    }
  }
]

const updateMatchupHandler = [
  authMatchupAdmin,
  async function updateMatchupFunc(req, res) {
    try {
      const matchupId = req.params.id
      const userId = res.locals.user._id
      logger.info(`updating matchup ${matchupId} for user ${userId}`, req.body)

      const updatedData = {}
      if (req.body.startDate) updatedData.startDate = req.body.startDate
      if (req.body.endDate) updatedData.endDate = req.body.endDate

      const updatedMatchup = await Matchup.findOneAndUpdate(
        { _id: matchupId },
        updatedData,
        { new: true }).exec()

      if (!updatedMatchup) {
        throw new Error('update returned null')
      }
      res.send(updatedMatchup)
    } catch (e) {
      logger.error(e)
      res.status(500).send({ error: 'unable to update matchup' })
    }
  }
]

const verifyMatchupHandler = [
  authMatchupAdmin,
  async function verifyMatchupFunc(req, res) {
    try {
      const matchupId = req.params.id
      const userId = res.locals.user._id
      logger.info(`attempting to verify matchup ${matchupId} as user ${userId}`)

      const winner = await matchupSvc.getWinner(matchupId)

      const updatedMatchup = await Matchup.findOneAndUpdate(
        { _id: matchupId },
        {
          winner: winner,
          verification: { verifier: userId, verifiedOn: moment().toDate() }
        },
        { new: true }).exec()

      res.send(updatedMatchup)
    } catch (e) {
      logger.error(e)
      res.status(500).send({ error: 'unable to verify matchup' })
    }
  }
]

const unverifyMatchupHandler = [
  authMatchupAdmin,
  async function unverifyMatchupFunc(req, res) {
    try {
      res.send()
    } catch (e) {
      logger.error(e)
      res.status(500).send({ error: 'unable to unverify matchup' })
    }
  }
]

const submitEntryMatchupHandler = [
  async function submitEntryMatchupFunc(req, res) {
    try {
      res.send()
    } catch (e) {
      logger.error(e)
      res.status(500).send({ error: 'unable to submit entry for matchup' })
    }
  }
]

module.exports = {
  getMatchupsHandler,
  updateMatchupHandler,
  verifyMatchupHandler,
  unverifyMatchupHandler,
  submitEntryMatchupHandler,
}