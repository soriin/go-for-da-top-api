const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId;
const Mixed = mongoose.Schema.Types.Mixed;


  // playerEntry ->
  // userId.
  //   imageProofUrl: String,
  //   exScore: Number,
  //   isWinner: Boolean

const player = mongoose.Schema({
  user: {
    type: ObjectId,
  ref: 'User',
  required: true
  },
  score: {
    type: Number,
    default: 0
  }
})

const battle = mongoose.Schema({
  song: {
    type: ObjectId,
    ref: 'Song'
  },
  chooser: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  entries: Mixed
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
    ref: 'Tournament',
    index: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate:{
    type: Date,
    required: true
  },
  players: [player],
  battles: [battle],
  verification: verification
})

module.exports = mongoose.model('Matchup', matchup)