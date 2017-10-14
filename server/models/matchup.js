const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId;

const playerEntry = mongoose.Schema({
  player: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  imageProofUrl: String,
  exScore: Number
})

const playerScore = mongoose.Schema({
  player: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    required: true
  }
})

const battle = mongoose.Schema({
  song: {
    type: ObjectId,
    ref: 'Song'
  },
  entries: [playerEntry],
  scores: [playerScore]
})

const verification = mongoose.Schema({
  verifier: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  verifiedOn: {
    type: Date,
    required: true
  }
})

const matchup = mongoose.Schema({
  tournament: {
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
  battles: [battle],
  verification: verification
})

module.exports = mongoose.model('Matchup', matchup)