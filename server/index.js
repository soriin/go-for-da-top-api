const express = require('express');
const passport = require('passport');
const Strategy = require('passport-facebook').Strategy;
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const Routes = require('./routes/routes')
const logger = require('./logging/logger')
const bodyParser = require('body-parser')

mongoose.Promise = global.Promise;
// Configure the Facebook strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Facebook API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new Strategy({
  clientID: process.env.clientID,
  clientSecret: process.env.clientSecret,
  callbackURL: `${process.env.rootUrl}/login/facebook/return`
},
  function (accessToken, refreshToken, profile, cb) {
    // In this example, the user's Facebook profile is supplied as the user
    // record.  In a production-quality application, the Facebook profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    logger.info(accessToken, refreshToken, profile)
    return cb(null, { profile, accessToken });
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Facebook profile is serialized
// and deserialized.
passport.serializeUser(function (user, cb) {
  logger.info('serializeUser', user)
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  logger.info('deserializeUser', obj)
  cb(null, obj);
});


// Create a new Express application.
var app = express();
var db = mongoose.connection;
db.on('error', logger.error.bind(console, 'connection error:'));
db.once('open', function () {
  logger.info('mongodb connected')
});

mongoose.connect(process.env.mongodb, {
  useMongoClient: true
});

const corsConfig = {
  origin: process.env.clientRootUrl
};

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(/^(?!.*submission).*$/, bodyParser.json());
app.use(require('express-session')({ secret: process.env.sessionKey, resave: true, saveUninitialized: true }));
app.use(cors(corsConfig));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

app.use('/', Routes)

app.listen(process.env.PORT, () => { logger.info(`Server started on : ${process.env.PORT}`) });