var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  displayName: String,
  accessToken: String,
  facebookId: String,
  realName: String,
  email: String
});

module.exports = mongoose.model('User', userSchema);