const socket = io();
let name;
let textarea = document.querySelector('#textarea');
let messageArea = document.querySelector('.message__area');
let unreadMessages = 0;
let originalTitle = document.title;

// Request notification permission
if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
}

// Ask for username
do {
    name = prompt('Please enter your name: ');
} while (!name);

// Play sound
let testSound = new Audio('/notification.mp3');

textarea.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        sendMessage(e.target.value);
    }
});

function sendMessage(message) {
    let msg = {
        user: name,
        message: message.trim()
    };

    appendMessage(msg, 'outgoing');
    textarea.value = '';
    scrollToBottom();
    socket.emit('message', msg);
}

function appendMessage(msg, type) {
    let mainDiv = document.createElement('div');
    mainDiv.classList.add(type, 'message');

    let markup = `
        <h4>${msg.user}</h4>
        <p>${msg.message}</p>
    `;
    mainDiv.innerHTML = markup;
    messageArea.appendChild(mainDiv);
}

function showSystemNotification(msg) {
    if (Notification.permission === "granted") {
        const notification = new Notification(`Message from ${msg.user}`, {
            body: msg.message,
            icon: '/wassup.png'
        });

        notification.onclick = () => {
            window.focus();
        };
    }
}

// Receive message
socket.on('message', (msg) => {
    appendMessage(msg, 'incoming');
    scrollToBottom();
    testSound.play();
    showSystemNotification(msg);

    if (!document.hasFocus()) {
        unreadMessages++;
        updateTitleNotification();
    }
});

function updateTitleNotification() {
    if (unreadMessages > 0) {
        document.title = `(${unreadMessages}) Wassup Chat App`;
    } else {
        document.title = originalTitle;
    }
}

window.addEventListener('focus', () => {
    unreadMessages = 0;
    updateTitleNotification();
});

function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight;
}
