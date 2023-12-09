const socket = io();

function setUserName() {
    const userNameInput = document.getElementById('userNameInput');
    const userEmailInput = document.getElementById('userEmailInput');

    const userName = userNameInput.value.trim();
    const userEmail = userEmailInput.value.trim();

    if (userName === '' || userEmail === '') {
        alert('Por favor, ingrese tanto el nombre como el correo.');
        return;
    }

    if (!isValidEmail(userEmail)) {
        alert('Por favor, ingrese un correo electrónico válido.');
        return;
    }

    socket.emit('setUserName', { userName, userEmail });

    document.getElementById('userNameForm').style.display = 'none';
    document.getElementById('chatContainer').style.display = 'block';
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

socket.on('chatHistory', (history) => {
    const chatBox = document.getElementById('chatBox');

    history.forEach((message) => {
        const chatMessage = `<p><strong>${message.user}:</strong> ${message.message}</p>`;
        chatBox.innerHTML += chatMessage;
    });
});

socket.on('chatMessage', (data) => {
    const chatBox = document.getElementById('chatBox');
    chatBox.innerHTML += `<p><strong>${data.userName}:</strong> ${data.message}</p>`;
});

socket.on('userConnected', (userName) => {
    const chatBox = document.getElementById('chatBox');
    chatBox.innerHTML += `<p><em>${userName} se ha unido al chat</em></p>`;
});

socket.on('userDisconnected', (userName) => {
    const chatBox = document.getElementById('chatBox');
    chatBox.innerHTML += `<p><em>${userName} se ha desconectado</em></p>`;
});

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value;
    socket.emit('sendMessage', message);
    messageInput.value = '';
}