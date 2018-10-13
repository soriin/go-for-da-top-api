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

const sanitizeMatchupSongs = function sanitizeMatchupSongsFunc(matchup, userId) {
  if (matchup.verification) return

  if (matchup.battles[0].song && matchup.battles[1].song) return

  const hiddenSong = {
    artist: '[hidden]',
    title: '[hidden]',
    alternateTitle: '[hidden]',
    bpm: 0,
    difficulty: '[hidden]',
    rating: 0,
    imageUrl: '',
    isSingles: true
  }
  if (matchup.battles[0].chooser._id.toString() !== userId.toString()) {
    matchup.battles[0].song = hiddenSong
  }
  if (matchup.battles[1].chooser._id.toString() !== userId.toString()) {
    matchup.battles[1].song = hiddenSong
  }
}

module.exports = {
  hasAdminPrivs,
  sanitizeMatchupScores,
  sanitizeMatchupSongs,
}