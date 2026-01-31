const { matchUser, skipUser } = require("./matcher");
const { hasBadWords } = require("./filters");

module.exports = function (io) {
  io.on("connection", (socket) => {
    let lastMessageTime = 0;

    // ===== USER JOINS WITH NAME =====
    socket.on("join", (name) => {
      socket.username = name;
      matchUser(socket); // match AFTER name is set
    });

    // ===== MESSAGE HANDLING =====
    socket.on("message", (data) => {
      if (!socket.partner) return;

      // rate limit (500ms)
      if (Date.now() - lastMessageTime < 500) return;
      lastMessageTime = Date.now();

      // length limit
      if (data.msg.length > 300) return;

      if (hasBadWords(data.msg)) {
        socket.emit("status", "⚠️ Bad language not allowed");
        return;
      }

      socket.partner.emit("message", {
        msg: data.msg,
        name: socket.username
      });
    });

    // ===== TYPING INDICATOR =====
    socket.on("typing", () => {
      socket.partner?.emit("typing");
    });

    // ===== NEXT CHAT =====
    socket.on("next", () => {
      skipUser(socket);
    });

    // ===== DISCONNECT =====
    socket.on("disconnect", () => {
      skipUser(socket, true);
    });
  });
};
