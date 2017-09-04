const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

var tournamentSchema = mongoose.Schema({
  title: String,
  creator: {
    type: ObjectId,
    index: true
  },
  startDate: {
    type: Date,
    index: true
  },
  endDate: {
    type: Date,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  entrants: [ObjectId],
});

module.exports = mongoose.model('Tournament', tournamentSchema);