const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId;

const playerEntry = mongoose.Schema({
  playerId: {
    type: ObjectId,
    ref: 'User'
  },
  imageProof: String,
  score: Number
})

const matchupSchema = mongoose.Schema({
  tournamentId: {
    type: ObjectId,
    ref: 'Tournament'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate:{
    type: Date,
    required: true
  },
  playerEntries: [playerEntry],
  winningEntry: {
    type: ObjectId,
    ref: 'PlayerEntry'
  }
})

module.exports = mongoose.model('PlayerEntry', playerEntry)
module.exports = mongoose.model('Matchup', matchupSchema)