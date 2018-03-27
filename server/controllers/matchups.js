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
          'players.user': userId
        })
        .populate('battles.song')
        .populate({path: 'players.user', select: '_id, displayName'})
        .populate({path: 'battles.chooser', select: '_id, displayName'})
        .lean()
        .exec()
      
      matchups.forEach(m => matchupSvc.sanitizeMatchupScores(m, userId))
      res.send({ matchups, count: matchups.length })
    } catch (e) {
      logger.error(e.stack)
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
        'playerScores',
        'songWinners',
      ]
      const verifiedData = sanitizeSvc.sanitize(req.body, validProperties)

      const theMatchup = await Matchup.findOne({ _id: matchupId }).exec()

      if (!theMatchup) {
        return res.status(404).end()
      }

      theMatchup.verification = { verifier: userId, verifiedOn: moment().toDate() }

      theMatchup.players.forEach(player => {
        player.score = verifiedData.playerScores[player.user]
      })

      theMatchup.battles.forEach(battle => {
        const winners = verifiedData.songWinners[battle.song]
        if (!winners) return

        Object.keys(battle.entries).forEach(entry => {
          if (winners.includes(entry)) {
            battle.entries[entry].isWinner = true
          } else {
            battle.entries[entry].isWinner = false
          }
        })
      })

      const savedData = await theMatchup.save()

      res.send(savedData)
    } catch (e) {
      logger.error({ err: e })
      res.status(500).send({ error: 'unable to verify matchup' })
    }
  }
]

const unverifyMatchupHandler = [
  authMatchupAdmin,
  async function unverifyMatchupFunc(req, res) {
    try {
      const userId = res.locals.user._id
      const matchupId = req.params.id
      logger.info(`attempting to unverify matchup ${matchupId} as user ${userId}`)

      const updated = await Matchup.findOneAndUpdate(
        { _id: matchupId },
        {
          verification: undefined,
          'players.score': 0
        },
        { new: true }
      ).lean()
        .exec()

      if (!updated) {
        return res.status(404).end()
      }

      res.send(updated)
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
        { _id: matchupId, 'battles.song': body.song, endDate: { $gte: moment().toDate() } },
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

const songSelectionHandler = [
  async function songSelectionFunc(req, res) {
    try {
      const matchupId = req.params.id
      const userId = res.locals.user._id
      logger.info(`attempting to set song selection for matchup ${matchupId} as user ${userId}`, req.body)

      const body = req.body
      const updateableProperties = [
        'songId'
      ]
      const updatedData = sanitizeSvc.sanitize(body, updateableProperties)

      const updatedMatchup = await Matchup.findOneAndUpdate(
        {
          _id: matchupId,
          battles: { $elemMatch: { chooser: userId } }
        },
        {
          'battles.$.song': updatedData.songId
        },
        { new: true })

      if (!updatedMatchup) {
        return res.status(404).end()
      }
      res.send(updatedMatchup)
    } catch (e) {
      logger.error(e)
      res.status(500).send({ error: 'unable to set song selection for matchup' })
    }
  }
]

module.exports = {
  getMatchupsHandler,
  updateMatchupHandler,
  verifyMatchupHandler,
  unverifyMatchupHandler,
  submitEntryMatchupHandler,
  songSelectionHandler,
}