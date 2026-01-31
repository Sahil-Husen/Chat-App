const socket = io();

let myName = "";

// UI elements
const nameScreen = document.getElementById("nameScreen");
const chatScreen = document.getElementById("chatScreen");
const chatBox = document.getElementById("chatBox");
const statusDiv = document.getElementById("status");
const msgInput = document.getElementById("msg");

// ========== CHECK LOCAL STORAGE ON LOAD ==========
window.onload = () => {
  const savedName = localStorage.getItem("chat_username");

  if (savedName) {
    myName = savedName;

    // RESET UI STATE
    chatBox.innerHTML = "";
    statusDiv.innerText = "Connecting to stranger...";

    nameScreen.style.display = "none";
    chatScreen.style.display = "block";

    socket.emit("join", myName);
  }
};


// ========== JOIN CHAT ==========
function joinChat() {
  const nameInput = document.getElementById("username");
  myName = nameInput.value.trim();

  if (!myName) {
    alert("Please enter your name");
    return;
  }

  // save name for refresh persistence
  localStorage.setItem("chat_username", myName);

  socket.emit("join", myName);

  nameScreen.style.display = "none";
  chatScreen.style.display = "block";
}

// ========== SOCKET EVENTS ==========
socket.on("status", (msg) => {
  statusDiv.innerText = msg;
});

socket.on("message", (data) => {
  chatBox.innerHTML += `<div><b>${data.name}:</b> ${data.msg}</div>`;
  chatBox.scrollTop = chatBox.scrollHeight;
});

socket.on("typing", () => {
  statusDiv.innerText = "Stranger is typing...";
  setTimeout(() => (statusDiv.innerText = ""), 800);
});

// ========== SEND MESSAGE ==========
function sendMsg() {
  const msg = msgInput.value.trim();
  if (!msg) return;

  chatBox.innerHTML += `<div><b>You:</b> ${msg}</div>`;
  socket.emit("message", { msg, name: myName });
  msgInput.value = "";
}

// ========== NEXT CHAT ==========
function nextChat() {
  chatBox.innerHTML = "";
  statusDiv.innerText = "Finding new stranger...";
  socket.emit("next");
}


// ========== ENTER KEY ==========
msgInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMsg();
  }
});

// ========== TYPING INDICATOR ==========
let typingTimer;
msgInput.addEventListener("input", () => {
  clearTimeout(typingTimer);
  socket.emit("typing");
  typingTimer = setTimeout(() => {}, 300);
});
