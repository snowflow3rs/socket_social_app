const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");


const app = express();

// Enable CORS for all origins (adjust in production)
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Be more specific in production
    methods: ["GET", "POST"],
  },
});
let users = [];
console.log(users);

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};
const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};
  
  const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
  };
  
io.on("connection", (socket) => {
  console.log("A user connected");
  // add user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers",users)
  });


  app.get("/", (req, res) => {
    return res.send("Hello World");
  });
   

// message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    
    
    io.to(user.socketId).emit("getMessage", {
      senderId,
      text,
    });
  });

  // disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected");
    removeUser(socket.id)
    io.emit("getUsers",users)
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
