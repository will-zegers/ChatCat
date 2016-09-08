'use strict';

const h                = require('../helpers');
const config           = require('../config');
const passport         = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy  = require('passport-twitter').Strategy;

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    h.findById(id)
      .then(user => done(null, user))
      .catch(err => console.log('Error when deserializing user: ', err));
  });

  let authProcessor = (accessToken, refreshToken, profile, done) => {
    // Find a user in the local db using profile.id
    // If the user is found, return the user data using the done()
    // If the user is not found, create one in the local db and return
    console.log('[+] profile: ', profile)
    h.findOne(profile.id)
      .then(result => {
        if (result) {
          done(null, result);
        } else {
          // Create a new user and reutrn
          h.createNewUser(profile)
            .then(newChatUser => done(null, newChatUser))
            .catch(err => console.log('createNewUser error: ', err));
        }
      })
  };

  passport.use(new FacebookStrategy(config.fb, authProcessor));
  passport.use(new TwitterStrategy(config.twitter, authProcessor));
}