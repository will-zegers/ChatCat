'use strict';

const db     = require('../db');
const crypto = require('crypto');
const router = require('express').Router();

let _registerRoutes = (routes, method) => {
  for (let key in routes) {
    if (typeof routes[key] === 'object' && routes[key] !== null && !(routes[key] instanceof Array)) {
      _registerRoutes(routes[key], key);
    } else {
      if (method === 'get') {
        router.get(key, routes[key]);
      } else if (method === 'post') {
        router.post(key, routes[key]);
      } else {
        router.use(routes[key])
      }
    }
  }
}

let route = routes => {
  _registerRoutes(routes);
  return router;
};

let findOne = profileId => {
  return db.userModel.findOne({
    'profileId': profileId
  });
};

let createNewUser = profile => {
  return new Promise((resolve, reject) => {
    let newChatUser = new db.userModel({
      profileId: profile.id,
      fullName: profile.displayName,
      profilePic: profile.photos[0].value || ''
    });

    newChatUser.save(err => {
      if (err) {
        reject(err);
      } else {
        resolve(newChatUser);
      }
    })
  });
}

let findById = id => {
  return new Promise((resolve, reject) => {
    db.userModel.findById(id, (err, user) => {
      if (err) {
        reject(err);
      } else {
        resolve(user);
      }
    })
  });
}

let isAuthenticated = (req, res, next) => {
  if(req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/');
  }
}

// Find chatroom by a given name
let findRoomByName = (allrooms, name) => {
  let findRoom = allrooms.findIndex((element, index, array) => {
    if (element.name === name) {
      return true;
    } else {
      return false;
    }
  });
  return (findRoom > -1) ? true : false;
}

// Find chatroom by a given name
let findRoomById = (allrooms, id) => {
  return allrooms.find((element, index, array) => {
    if (element.roomId === id) {
      return true;
    } else {
      return false;
    }
  });
}

// Iterate through the routes object and mount the routes
let randomHex = () => {
  return crypto.randomBytes(24).toString('hex');
}

let addUserToRoom = (allrooms, data, socket) => {
  //Get the room object
  let getRoom = findRoomById(allrooms, data.roomId);
  if (getRoom !== undefined) {
    // Get the active user's Id (ObjectId as used in session)
    let userId = socket.request.session.passport.user;
    // Check to see if this user already exists
    let checkUser = getRoom.users.findIndex((element, index, array) => {
      return (element.userId === userId) ? true : false;
    });

    // IF the user is already present in the room, remove him first
    if (checkUser > -1) {
      getRoom.users.splice(checkUser, 1);
    }

    // Push the user into the room's user array
    getRoom.users.push({
      socketId: socket.id,
      userId,
      user: data.user,
      userPic: data.userPic
    });

    // Join the room channel
    socket.join(data.roomId);

    // Return the updated room object
    return getRoom;
  }
}

let removeUserFromRoom = (allrooms, socket) => {
  for (let room of allrooms) {
    // Find the user
    let findUser = room.users.findIndex((element, index, array) => {
      return (element.socketId === socket.id) ? true : false;
    });

    if (findUser > -1) {
      socket.leave(room.roomId);
      room.users.splice(findUser, 1);
      return room
    } 
  }
}

module.exports = {
  route,
  findOne,
  createNewUser,
  findById,
  isAuthenticated,
  findRoomByName,
  findRoomById,
  randomHex,
  addUserToRoom,
  removeUserFromRoom
};