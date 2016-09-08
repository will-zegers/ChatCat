'use strict';

const config   = require('../config');
const mongoose = require('mongoose').connect(config.dbURI);

mongoose.connection.on('error', err => {
  console.log('MongoDB Error: ', err);
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