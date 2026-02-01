const socket = io();

let myName = "";

// UI elements
const nameScreen = document.getElementById("nameScreen");
const chatScreen = document.getElementById("chatScreen");
const chatBox = document.getElementById("chatBox");
const statusDiv = document.getElementById("status");
const msgInput = document.getElementById("msg");




// AGE VERIFICATION

const ageScreen = document.getElementById("ageScreen");

// ---------- AGE CHECK ON LOAD ----------
window.addEventListener("load", () => {
  const ageVerified = sessionStorage.getItem("age_verified");

  if (ageVerified === "true") {
    ageScreen.style.display = "none";
    nameScreen.style.display = "block";
  } else {
    ageScreen.style.display = "block";
    nameScreen.style.display = "none";
    chatScreen.style.display = "none";
  }
});

// ---------- AGE CONFIRM ----------
function confirmAge(isAdult) {
  if (!isAdult) {
    alert("Sorry, you must be 18 or older to use this service.");
    window.location.href = "https://www.google.com";
    return;
  }

  sessionStorage.setItem("age_verified", "true");
  ageScreen.style.display = "none";
  nameScreen.style.display = "block";
}


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

// ========== CLEAR USERNAME WHEN USER LEAVES ==========
window.addEventListener("beforeunload", () => {
  localStorage.removeItem("chat_username");
});
window.addEventListener("unload", () => {
  socket.emit("leave");
});

// ========== JOIN CHAT ==========
function joinChat() {
  if (sessionStorage.getItem("age_verified") !== "true") {
    alert("Age verification required");
    return;
  }

  const nameInput = document.getElementById("username");
  myName = nameInput.value.trim();

  if (!myName) {
    alert("Please enter your name");
    return;
  }

  localStorage.setItem("chat_username", myName);
  socket.emit("join", myName);

  nameScreen.style.display = "none";
  chatScreen.style.display = "block";
}


// ========== ENTER KEY TO START CHAT ==========
const usernameInput = document.getElementById("username");

usernameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    joinChat();
  }
});

window.onload = () => {
  document.getElementById("username").focus();
};

let joined = false;

function joinChat() {
  if (joined) return;
  joined = true;

  const nameInput = document.getElementById("username");
  myName = nameInput.value.trim();

  if (!myName) {
    joined = false;
    alert("Please enter your name");
    return;
  }

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
  const wrapper = document.createElement("div");

  const nameEl = document.createElement("strong");
  nameEl.textContent = data.name + ": ";

  const msgEl = document.createElement("span");
  msgEl.textContent = data.msg;

  wrapper.appendChild(nameEl);
  wrapper.appendChild(msgEl);

  chatBox.appendChild(wrapper);
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
  localStorage.clear();
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
