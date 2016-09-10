'use strict';

const h = require('../helpers');

module.exports = (io, app) => {
  let allrooms = app.locals.chatrooms;

  allrooms.push({
    name: 'Good Food',
    id: '0001',
    users: []
  });

  allrooms.push({
    name: 'Cloud Computing',
    id: '0002',
    users: []
  });

  io.of('/roomslist').on('connection', socket => {
    socket.on('getChatrooms', () => {
      socket.emit('chatroomsList', JSON.stringify(allrooms));
    });

    socket.on('createNewRoom', newRoomInput => {
      // check to see if a room with the same title exists or not. If not,
      // create one and broadcast it to everyone
      if (!h.findRoomByName(allrooms, newRoomInput)) {
        allrooms.push({
          name: newRoomInput,
          roomId: h.randomHex(),
          users: []
        });

        // Emit an updated list to the creator
        socket.emit('chatroomsList', JSON.stringify(allrooms));

        // Emit an updated list to everyone connected the rooms page
        socket.broadcast.emit('chatroomsList', JSON.stringify(allrooms));
      }
    });
  });

  io.of('/chatter').on('connection', socket => {
    // Join a chatroom
    socket.on('join', data => {
      let room = h.addUserToRoom(allrooms, data, socket);
      
      // Update the list of active users as shown on the chatroom page
      socket.broadcast.to(data.roomId).emit('updateUsersList', JSON.stringify(room.users));
      socket.emit('updateUsersList', JSON.stringify(room.users));
    });

    // When a socket exits
    socket.on('disconnect', () => {
      //Find the room, to which the socket is connected to and purge the user
      let room = h.removeUserFromRoom(allrooms, socket);
      
      // Update the list of active users as shown on the chatroom page
      socket.broadcast.to(room.roomId).emit('updateUsersList', JSON.stringify(room.users));
    });

    socket.on('newMessage', data => {
      socket.broadcast.to(data.roomId).emit('inMessage', JSON.stringify(data));
    });
  });
}