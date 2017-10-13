const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const tournamentSchema = mongoose.Schema({
  title: String,
  creator: {
    type: ObjectId,
    index: true,
    ref: 'User'
  },
  startDate: {
    type: Date,
    index: true
  },
  endDate: {
    type: Date,
    index: true
  },
  weeks: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isComplete: {
    type: Boolean,
    default: false
  },
  entrants: [{
    type: ObjectId,
    ref: 'PlayerEntry'
  }],
  organizers: [{
    type: ObjectId,
    ref: 'User'
  }]
});

module.exports = mongoose.model('Tournament', tournamentSchema);