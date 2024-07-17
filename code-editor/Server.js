const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const ACTIONS = require("./src/Actions");

const server = http.createServer(app);
const io = new Server(server);

const userSocketMap = {};

function getAllConnectedUsers(roomID) {
  return Array.from(io.sockets.adapter.rooms.get(roomID) || []).map(
    (socketID) => {
      return {
        socketID,
        username: userSocketMap[socketID],
      };
    }
  );
}

io.on('connection', (socket) => {
  console.log("Socket Connected ", socket.id);

  socket.on(ACTIONS.JOIN, ({ roomID, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomID);

    // Notify the new user about all connected users
    const users = getAllConnectedUsers(roomID);
    socket.emit(ACTIONS.JOINED, {
      users,
      username,
      socketID: socket.id,
    });

    // Notify all users in the room about the new user
    users.forEach(({ socketID }) => {
      if (socketID !== socket.id) {
        io.to(socketID).emit(ACTIONS.JOINED, {
          users: [{ socketID: socket.id, username }],
          username,
          socketID: socket.id,
        });
      }
    });
  });
});

const Port = process.env.Port || 5000;
server.listen(Port, () => console.log(`Listening on port ${Port}`));
