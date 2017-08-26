const express = require('express');
const passport = require('passport');
const Strategy = require('passport-facebook').Strategy;
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const User = require('./models/user');

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
  function(accessToken, refreshToken, profile, cb) {
    // In this example, the user's Facebook profile is supplied as the user
    // record.  In a production-quality application, the Facebook profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    console.log(accessToken, refreshToken, profile)
    return cb(null, {profile, accessToken});
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
passport.serializeUser(function(user, cb) {
  console.log('serializeUser', user)
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  console.log('deserializeUser', obj)
  cb(null, obj);
});


// Create a new Express application.
var app = express();
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('mongodb connected')
});

mongoose.connect(process.env.mongodb, {
  useMongoClient: true
});

const corsConfig = {
  origin: 'http://local.goforda.top:5000'
};

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'fs1e56f1sef1 sf1ea6f1 efaewfeafesfe5156103', resave: true, saveUninitialized: true }));
app.use(cors(corsConfig));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


// Define routes.
app.get('/login/facebook',
  passport.authenticate('facebook'));

app.get('/login/facebook/return', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.cookie('gfdt_access_token_id', req.user.accessToken)
    res.cookie('gfdt_access_token_userid', req.user.profile.id)
    res.cookie('gfdt_access_token_user', req.user.profile)

    User.findOne({facebookId: req.user.profile.id})
    .then((dbUser) => {
      if (dbUser) {
        dbUser.accessToken = req.user.accessToken;
        console.log('updated user', dbUser)
        return dbUser.save();
      } else {
        let newUser = new User();
        newUser.accessToken = req.user.accessToken;
        newUser.facebookId = req.user.profile.id;
        newUser.realName = req.user.profile.displayName;
        console.log('added new user', req.user)
        return newUser.save()
      }
    })
    .then(() => {
      res.redirect(process.env.clientRootUrl);
    })
  });

  app.get('/user/me',auth,
    (req, res) => {
      const token = res.locals.token;
      console.log(token);
      User.findOne({accessToken: token})
      .then((user) => {
        res.send(user);
      })      
  });

app.listen(process.env.PORT, () => {console.log(`Server started on : ${process.env.PORT}`)});

function auth(req, res, next) {
  try {      
    const auth = req.headers['authorization'].split('Bearer ')[1];
    if (auth) {
      res.locals.token = auth;
      req.user = {yep: true};
    }
    next(null);
  } catch (e) {
    console.error(e)
    next('auth failed');
  }
}