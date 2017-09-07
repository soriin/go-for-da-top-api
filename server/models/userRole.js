const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const userRoleSchema = mongoose.Schema({
  role: String,
  userId: {
    type: ObjectId,
    index: true
  },
  tournamentId: {
    type: ObjectId,
    index: true
  },
});

module.exports = mongoose.model('UserRole', userRoleSchema);