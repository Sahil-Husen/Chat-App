const geoip = require("geoip-lite");
const { matchUser, skipUser } = require("./matcher");
const { hasBadWords } = require("./filters");

module.exports = function (io) {
  io.on("connection", (socket) => {
    let lastMessageTime = 0;
    let msgCount = 0;

    // reset message counter every 10s (per socket)
    const msgResetTimer = setInterval(() => {
      msgCount = 0;
    }, 10000);

    // ===== USER JOINS WITH NAME =====
    socket.on("join", (name) => {
      socket.username = name || "Stranger";

      // -------- GET USER IP --------
      let ip =
        socket.handshake.headers["x-forwarded-for"] ||
        socket.handshake.address;

      if (ip && ip.includes(",")) ip = ip.split(",")[0].trim();
      if (ip && ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");

      const geo = geoip.lookup(ip);
      socket.country = geo ? geo.country : "Unknown";

      // 🔐 privacy: remove IP reference
      delete socket.handshake.address;

      matchUser(socket);
    });

    // ===== MESSAGE HANDLING =====
    socket.on("message", (data) => {
      if (!socket.partner) return;

      // rate limit (500ms)
      if (Date.now() - lastMessageTime < 500) return;
      lastMessageTime = Date.now();

      // flood protection
      msgCount++;
      if (msgCount > 20) {
        socket.emit("status", "⚠️ You are sending messages too fast");
        socket.disconnect();
        return;
      }

      // length limit
      if (!data.msg || data.msg.length > 300) return;

      // bad words
      if (hasBadWords(data.msg)) {
        socket.emit("status", "⚠️ Bad language not allowed");
        return;
      }

      socket.partner.emit("message", {
        msg: data.msg,
        name: socket.username
      });
    });

    // ===== TYPING =====
    socket.on("typing", () => {
      socket.partner?.emit("typing");
    });

    // ===== NEXT CHAT =====
    socket.on("next", () => {
      skipUser(socket);
    });

    // ===== DISCONNECT =====
    socket.on("disconnect", () => {
      clearInterval(msgResetTimer);
      skipUser(socket, true);
    });
  });
};
