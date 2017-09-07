const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  displayName: String,
  accessToken: String,
  facebookId: {
    type: String,
    index: true
  },
  realName: String,
  email: String
});

module.exports = mongoose.model('User', userSchema);