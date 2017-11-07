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

const sanitizeMatchupScores = function sanitizeMatchupScoresFunc(matchup, userId) {
  if (matchup.verification) return

  matchup.battles.forEach(b => {
    if (!b.entries) return
    Object.keys(b.entries).forEach(user => {
      if (user === userId) return
      b.entries[user] = undefined
    })
  })
}

module.exports = {
  hasAdminPrivs,
  sanitizeMatchupScores,
}