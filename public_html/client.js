
let socket = io();

const joinFailureMessageTag = document.getElementById("join-failure-message");

const usernameTag = document.getElementById("username-input");
const joinButtonTag = document.getElementById("join-button");
joinButtonTag.onclick = function() {
    let user = usernameTag.value;
    if (user.length == 0) {
        joinFailureMessageTag.innerText = "Please enter a username";
    } else if (user.length > 30) {
        joinFailureMessageTag.innerText = "Your username cannot exceed 30 characters";
    }
    socket.emit("join", user);
}

socket.on("join-failure", (reason) => {
    joinFailureMessageTag.innerText = reason;
});

const playerCountTag = document.getElementById("player-count");
const startButtonTag = document.getElementById("start-button");

let joined = false;

startButtonTag.onclick = function() {
    socket.emit('start');
}

socket.on('start', () => {
    startButtonTag.disabled = true;
    document.getElementById("waiting-for-players").innerHTML = "Game is starting.";
    setTimeout(() => {
        document.getElementById("waiting-display").style.display = "none";
        document.getElementById("game-display").style.display = "inline";
    }, 2000);
});

socket.on("players", players => {
    if (!joined) {
        document.getElementById("join-display").style.display = 'none';
        document.getElementById("waiting-display").style.display = 'inline';
        joined = true;
    }
    playerCountTag.innerText = players.length;
    if (players.length > 1) {
        // let's then enable the start button
        startButtonTag.disabled = false;
    } else {
        // otherwise disable it.
        startButtonTag.disabled = true;
    }
    const list = document.getElementById("player-list");
    list.innerHTML = "";
    players.forEach(player => {
        item = document.createElement("li");
        item.innerHTML = player.username;
        if (player.username == usernameTag.value) {
            item.innerHTML = "<b>" + item.innerHTML + "</b>"
        }
        list.append(item);
    });
});

socket.on('disconnect', () => {
    socket.emit('disconnect');
});