const Matchup = require('../models/matchup')

const hasAdminPrivs = async function hasAdminPrivsFunc(matchupId, userId) {
  const matchup = await Matchup
    .findOne({ _id: matchupId })
    .populate({
      path: 'tournament',
      match: {
        organizers: userId
      }
    }).lean().exec()

  if (!matchup || !matchup.tournament) {
    return false
  }
  return true
}

const getWinner = async function getWinnerFunc(matchupId) {
  const matchup = await Matchup.fineOne({_id: matchupId}).lean().exec()
}

module.exports = {
  hasAdminPrivs,
  getWinner
}