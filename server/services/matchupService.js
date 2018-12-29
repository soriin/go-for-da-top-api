const Matchup = require('../models/matchup')

const genFakeSong = (fakeType) => {
  return {
    artist: `[${fakeType}]`,
    title: `[${fakeType}]`,
    alternateTitle: `[${fakeType}]`,
    bpm: 0,
    difficulty: `[${fakeType}]`,
    rating: 0,
    imageUrl: '',
    isSingles: true,
    isHidden: true
  }
}

const hasAdminPrivs = async (matchupId, userId) => {
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

const sanitizeMatchupScores = (matchup, userId) => {
  if (matchup.verification) return

  matchup.battles.forEach(b => {
    if (!b.entries) return
    Object.keys(b.entries).forEach(user => {
      if (user === userId.toString()) return
      b.entries[user] = undefined
    })
  })
}

const sanitizeMatchupSongs = (matchup, userId) => {
  if (matchup.verification) return

  if (matchup.battles[0].song && matchup.battles[1].song) return

  const sanitizeSong = (index) => {
    if (matchup.battles[index].chooser._id.toString() !== userId.toString()) {
      let hiddenSongData
      if (matchup.battles[index].song) {
        hiddenSongData = genFakeSong('hidden')
      } else {
        hiddenSongData = genFakeSong('not chosen, yet')
      }
      matchup.battles[index].song = hiddenSongData
    }
  }

  sanitizeSong(0)
  sanitizeSong(1)
}

module.exports = {
  hasAdminPrivs,
  sanitizeMatchupScores,
  sanitizeMatchupSongs,
}