let waitingQueue = [];

function matchUser(socket) {
  if (socket.partner) return;

  if (waitingQueue.length === 0) {
    waitingQueue.push(socket);
    socket.emit("status", "Waiting for stranger...");
  } else {
    const partner = waitingQueue.shift();

    socket.partner = partner;
    partner.partner = socket;

    socket.emit(
      "status",
      `Connected with ${partner.username || "Stranger"}`
    );
    partner.emit(
      "status",
      `Connected with ${socket.username || "Stranger"}`
    );
  }
}

function skipUser(socket, isDisconnect = false) {
  waitingQueue = waitingQueue.filter(s => s.id !== socket.id);

  if (socket.partner) {
    socket.partner.emit(
      "status",
      isDisconnect ? "Stranger disconnected" : "Stranger skipped"
    );

    socket.partner.partner = null;
    matchUser(socket.partner);
  }

  socket.partner = null;

  if (!isDisconnect) {
    matchUser(socket);
  }
}

module.exports = { matchUser, skipUser };
