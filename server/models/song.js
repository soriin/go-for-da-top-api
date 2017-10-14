const mongoose = require('mongoose')

const song = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  alternateTitle: {
    type: String
  },
  difficulty: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  imageUrl: String,
  isSingles: {
    type: Boolean,
    default: true
  }
})

module.exports = mongoose.model('Song', song)