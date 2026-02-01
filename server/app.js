const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
 



const socketHandler = require("./socket");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

socketHandler(io);

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log("Server running at http://localhost:3000");
});
