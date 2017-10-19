const Matchup = require('../models/matchup')
const logger = require('../logging/logger')
const moment = require('moment')
const matchupSvc = require('../services/matchupService')
const sanitizeSvc = require('../services/sanitizeService')

const authMatchupAdmin = async function authMatchupAdminFunc(req, res, next) {
  try {
    const matchupId = req.params.id
    const userId = res.locals.user._id
    logger.info(`ensuring user ${userId} has admin privs on matchup ${matchupId}`)

    const isAdmin = await matchupSvc.hasAdminPrivs(matchupId, userId)

    if (!isAdmin) {
      logger.warn(`user ${userId} does not have admin privs on matchup ${matchupId}`)
      return res.status(404).end()
    }
    next()
  } catch (e) {
    logger.error(e)
    return res.status(404).end()
  }

}

const getMatchupsHandler = [
  async function getMatchupsFunc(req, res) {
    try {
      const userId = res.locals.user._id
      logger.info(`getting matchups for user ${userId}`)
      const matchups = await Matchup
        .find({
          $or: [
            { 'player1.user': userId },
            { 'player2.user': userId }
          ]
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
      const body = req.body

      const updateableProperties = [
        'endDate',
        'startDate'
      ]
      const updatedData = sanitizeSvc.sanitize(body, updateableProperties)

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
      logger.info(`attempting to verify matchup ${matchupId} as user ${userId}`, req.body)

      const validProperties = [
        'player1Score',
        'player2Score',
        'battle1Winners',
        'battle2Winners'
      ]
      const verifiedData = sanitizeSvc.sanitize(req.body, validProperties)

      const theMatchup = await Matchup.findOne({ _id: matchupId }).exec()

      if (!theMatchup) {
        return res.status(404).end()
      }

      theMatchup.verification = { verifier: userId, verifiedOn: moment().toDate() }
      theMatchup.player1.score = verifiedData.player1Score
      theMatchup.player2.score = verifiedData.player2Score

      verifiedData.battle1Winners.forEach(winner => {
        const entry = theMatchup.battle[0].entries[winner]
        if (entry) {
          entry.isWinner = true
        }
      })
      verifiedData.battle2Winners.forEach(winner => {
        const entry = theMatchup.battle[1].entries[winner]
        if (entry) {
          entry.isWinner = true
        }
      })

      const savedData = await theMatchup.save()

      res.send(savedData)
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
      const matchupId = req.params.id
      const userId = res.locals.user._id
      logger.info(`attempting to submit entry for matchup ${matchupId} as user ${userId}`, req.body)

      const body = req.body
      const updateableProperties = [
        'exScore',
        'imageProofUrl'
      ]
      const updatedData = sanitizeSvc.sanitize(body, updateableProperties)
      updatedData.userId = userId
      const updateValue = {}
      updateValue[`${userId}`] = updatedData

      const updatedMatchup = await Matchup.findOneAndUpdate(
        { _id: matchupId, 'battles.song': body.song },
        {
          'battles.$.entries': updateValue
        },
        { new: true }
      )
        .lean()
        .exec()

      if (!updatedMatchup) {
        return res.status(404).end()
      }

      res.send(updatedMatchup)
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