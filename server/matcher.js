let waitingQueue = [];

function matchUser(socket) {
  if (socket.partner) return;

  // ---- NO USER WAITING ----
  if (waitingQueue.length === 0) {
    waitingQueue.push(socket);
    socket.emit("status", "Waiting for stranger...");
    return;
  }

  // ---- MATCH FOUND ----
  const partner = waitingQueue.shift();

  socket.partner = partner;
  partner.partner = socket;

  // Status to current socket
  socket.emit(
    "status",
    `Connected with stranger from ${partner.country || "Unknown"}`
  );

  // Status to partner socket
  partner.emit(
    "status",
    `Connected with stranger from ${socket.country || "Unknown"}`
  );
}

function skipUser(socket, isDisconnect = false) {
  // Remove from waiting queue
  waitingQueue = waitingQueue.filter((s) => s.id !== socket.id);

  if (socket.partner) {
    socket.partner.emit(
      "status",
      isDisconnect ? "Stranger disconnected" : "Stranger skipped"
    );

    socket.partner.partner = null;

    // Re-match partner if not disconnect
    if (!isDisconnect) {
      matchUser(socket.partner);
    }
  }

  socket.partner = null;

  // Re-match current socket only if not disconnect
  if (!isDisconnect) {
    matchUser(socket);
  }
}

module.exports = { matchUser, skipUser };
