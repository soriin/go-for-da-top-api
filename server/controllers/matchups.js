const Matchup = require('../models/matchup')
const logger = require('../logging/logger')

const getMatchupsHandler = [
  async function getMatchupsFunc(req, res) {
    try {
      const userId = res.locals.user._id
      logger.info(`getting matchups for user ${userId}`)
      const matchups = await Matchup.find({playerEntries: {$elemMatch: { playerId: userId}}}, ).lean().exec()
      res.send({matchups, count: matchups.length})
    } catch (e) {
      logger.error(e)
      res.status(500).send({error: 'unable to retrieve matchups'})
    }
  }
]

const updateMatchupHandler = [
  async function updateMatchupFunc(req, res) {
    try {
      const matchupId = req.params.id
      const userId = res.locals.user._id
      logger.info(`updating matchup ${matchupId} for user ${userId}`, req.body)
      
      const matchup = await Matchup
        .findOne({_id: matchupId})
        .populate({
          path: 'tournamentId',
          match: {
            organizers: userId
          }
        }).lean().exec()

      if (!matchup || !matchup.tournamentId) {
        return res.status(404).send()
      }
      
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
      res.status(500).send({error: 'unable to update matchup'})
    }
  }
]

const verifyMatchupHandler = [
  async function verifyMatchupFunc(req, res) {
    try {
      res.send()
    } catch (e) {
      logger.error(e)
      res.status(500).send({error: 'unable to verify matchup'})
    }
  }
]

const unverifyMatchupHandler = [
  async function unverifyMatchupFunc(req, res) {
    try {
      res.send()
    } catch (e) {
      logger.error(e)
      res.status(500).send({error: 'unable to unverify matchup'})
    }
  }
]

const submitEntryMatchupHandler = [
  async function submitEntryMatchupFunc(req, res) {
    try {
      res.send()
    } catch (e) {
      logger.error(e)
      res.status(500).send({error: 'unable to submit entry for matchup'})
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