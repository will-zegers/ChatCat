'use strict';

const config   = require('../config');
const mongoose = require('mongoose').connect(config.dbURI);

mongoose.connection
  .on('error', err => {
    console.log('[-] Mongoose connection error: ', err);
  })
  .on('connected', () => {
    console.log('[+] Mongoose connected to ' + config.dbURI);
  })
  .on('disconnected', () => {
    console.log('[!] Mongoose disconnected');
  });

var gracefulShutdown = (msg, callback) => {
  mongoose.connection.close(() => {
    console.log('[i] Mongoose disconnected through ' + msg);
    callback();
  });
}

process
  .once('SIGUSR2', () => {
    gracefulShutdown('nodemon restart', () => {
      process.kill(process.pid, 'SIGUSR2');
    })
  })
  .on('SIGINT', () => {
    gracefulShutdown('app termination', () => {
      process.exit(0);
    });
  })
  .on('SIGTERM', () => {
    gracefulShutdown('Heroku shutdown', () => {
      process.exit(0);
    })
  });

const chatUser = new mongoose.Schema({
  profileId: String,
  fullName: String,
  profilePic: String
});

let userModel = mongoose.model('chatUser', chatUser);

module.exports = {
  mongoose,
  userModel
}