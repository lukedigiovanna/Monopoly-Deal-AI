
let properties = new Map();
properties.set("black", [1, 2, 3, 4]);
properties.set("brown", [1, 2]);
properties.set("lightgreen", [1, 2]);
properties.set("purple", [1, 2, 4]);
properties.set("lightblue", [1, 2, 3]);
properties.set("orange", [1, 3, 5]);
properties.set("red", [2, 3, 6]);
properties.set("yellow", [2, 4, 6]);
properties.set("green", [2, 4, 7]);
properties.set("blue", [3, 8]);

// get the client socket
let socket = io();

// stores if this client has joined the game or not
let joined = false;
let username = "";

// define behavior for clicking the join button
$("#join-button").on('click', () => {
    let user = $("#username-input").val();
    if (user.toLowerCase() == 'john') {
        user = "CringeLord";
        $("#username-input").attr("value", user);
    }
    if (user.length == 0) {
        $("#join-failure-message").text("Please enter a username");
    } else if (user.length > 30) {
        $("#join-failure-message").text("Your username cannot exceed 30 characters");
    } else {
        // check if the name contains a space
        for (var i = 0; i < user.length; i++) {
            if (user[i] == ' ') {
                $("#join-failure-message").text("Your username cannot contain any spaces");
                return;
            }
        }
        username = user;
        socket.emit("join", user);
    }
});

// set the join failure message when the issue is server side.
socket.on("join-failure", (reason) => {
    $('#join-failure-message').text(reason);
});

// start the game when the start button is clicked.
$('button#start-button').on('click', () => {
    socket.emit('start');
});

// define client side behavior for starting the game.
socket.on('start', () => {
    $('button#start-button').prop('disabled', true);
    $("#waiting-for-players").text("Game is starting.");
    setTimeout(() => {
        $("#waiting-display").css('display', 'none');
        $("#game-display").css('display', 'inline');
    }, 2000);
});

addCard({value: 4, type: "action", title: "Just Say No.", description: "Cancels any action card played against you."});
addCard({value: 1, type: "action", title: "Pass Go.", description: "Get two cards."});
addCard({value: 5, type: "money"});
addCard({value: 10, type: "money"});
addCard({value: 4, type: "property", title: "Park Place", colors: "blue"});
addCard({value: 4, type: "property", title: "Wild Property", colors: "red purple orange green yellow lightgreen brown black lightblue blue"});
addCard({value: 4, type: "property", title: "Wild Property", colors: "lightgreen black"});

function updateWaitingDisplay(players) {
    $("#player-count").text(players.length);
    
    if (players.length > 1) {
        // let's then enable the start button
        $('button#start-button').prop('disabled', false);
    } else {
        // otherwise disable it.
        $('button#start-button').prop('disabled', true);
    }
    const list = document.getElementById("player-list");
    list.innerHTML = "";
    players.forEach(player => {
        item = document.createElement("li");
        item.innerHTML = player.username;
        if (player.username == $("#username-input").val()) {
            item.innerHTML = "<b>" + item.innerHTML + "</b>"
        }
        list.append(item);
    });
}

socket.on("players", players => {
    if (!joined) {
        $("#join-display").css('display', 'none');
        $("#waiting-display").css('display', 'inline');
        joined = true;
    }
    updateWaitingDisplay(players);
});

socket.on("player-update", player => {
    // go through that player's hand and reupdate the display
    $("#your-hand").html("");
    player.hand.forEach(card => {
        addCard(card);
    });
});

socket.on('end', (players) => {
    if (joined) {
        alert("Someone left the game! Sending you back to the waiting room.");
        $('#game-display').css('display', 'none');
        $('#waiting-display').css('display', 'inline');
        $('button#start-button').prop('disabled', false);
        $("#waiting-for-players").html("Waiting for players... <span id='player-count'>1</span>/5.");
        updateWaitingDisplay(players);
    } else {
        $("#join-failure-message").text("");
    }
});

// server sends a list of all updated player data
// this event should be responsible for updating the display
socket.on("player-move", (card, turn, moves, players) => {
    if (card != null) {
        console.log(card);
        if (card == "first") {
            $('last-played-card').html(""); // clear the card slot
            // replace it with a card representation of the played card
            document.getElementById('last-played-card').appendChild(makeCard({type: "action", value: "?", title: "Nothing!", description: "The last played action card will show up here."}));
        }
        // check if the card is an action card
        else if (card.type == "action") {
            // then update the card in the action slot on the screen to reflect that card.
            $('last-played-card').html(""); // clear the card slot
            // replace it with a card representation of the played card
            document.getElementById('last-played-card').appendChild(makeCard(card));
        } 
    } 
    if (players[turn].username == username) {
        $("#moves").text("It's your turn! You have " + moves + " moves left.");
    } else {
        $("#moves").text("It's " + players[turn].username + "'s turn. They have " + moves + " moves left.");
    }
    $("#board").html("<tr><th style='width: 20%'> Player </th> <th style='width: 50%'> Properties </th> <th style='width: 20%'> Bank </th> <th style='width: 10%'> Net Worth </th></tr>"); // reset the table
    for (var i = 0; i < players.length; i++) {
        let row = document.createElement("tr");
        if (i == turn) {
            row.style.backgroundColor = 'aqua';
        }
        let name = document.createElement('td');
        name.innerText = players[i].username;
        row.appendChild(name);
        $("#board").append(row);
    }
});

socket.on('disconnect', () => {
    socket.emit('disconnect');
});

function addCard(card) {
    let c = makeCard(card);
    document.getElementById("your-hand").append(c);
}

function makeCard(card) {
    let div = document.createElement("div");
    
    div.classList.add('card');

    switch (card.value) {
        case 1:
            div.style.backgroundColor = 'gray';
            break;
        case 2: 
            div.style.backgroundColor = 'orange';
            break;
        case 3:
            div.style.backgroundColor = 'green';
            break;
        case 4:
            div.style.backgroundColor = 'blue';
            break;
        case 5:
            div.style.backgroundColor = 'purple';
            break;
        case 10:
            div.style.backgroundColor = 'red';
    }

    let tlv = document.createElement('p');
    tlv.classList.add('value');
    tlv.classList.add('value-left');
    tlv.innerText = '$' + card.value;
    let trv = document.createElement('p');
    trv.classList.add('value');
    trv.classList.add('value-right');
    trv.innerText = '$' + card.value;
    div.appendChild(tlv);
    div.appendChild(trv);

    div.appendChild(document.createElement('br'));

    switch (card.type) {
        case "action":
            let label = document.createElement('p');
            label.classList.add('card-type');
            label.innerText = "ACTION";
            div.appendChild(label);
            let title = document.createElement('p');
            title.classList.add('card-title');
            title.innerText = card.title;
            div.appendChild(title);
            let description = document.createElement('p');
            description.classList.add('card-description');
            description.innerText = card.description;
            div.appendChild(description);
            if (card.title == "Rent") {
                let colors = card.colors.split(' ');
                let gradient = "";
                if (colors.length == 2) {
                    gradient = colors[0] + ", " + colors[1];
                } else {
                    gradient = "red, orange, yellow, green, blue, purple";
                }
                
                div.style.background = "linear-gradient(90deg, " + gradient + ")";
            }
            break;
        case "property":
            let name = document.createElement('p');
            name.classList.add("card-title");
            name.innerText = card.title;
            div.appendChild(name);
            let rent = document.createElement('p');
            rent.innerHTML = "RENT <br>";
            if (card.title == "Wild Property") {
                let colors = card.colors.split(' ');
                let gradient = "";
                if (colors.length == 2) {
                    gradient = colors[0] + ", " + colors[1];
                } else {
                    gradient = "red, orange, yellow, green, blue, purple";
                    rent.innerHTML = "";
                }
                
                div.style.background = "linear-gradient(90deg, " + gradient + ")";
                if (colors.length == 2) {
                    // add in the rent
                    let rent1 = properties.get(colors[0]);
                    let rent2 = properties.get(colors[1]);
                    for (var i = 0; i < Math.max(rent1.length, rent2.length); i++) {
                        let row = "";
                        if (i < rent1.length) {
                            row += "$" + rent1[i];
                        } else {
                            row += "  ";
                        }
                        row += " | ";
                        if (i < rent2.length) {
                            row += "$" + rent2[i];
                        }
                        row += "<br>";
                        rent.innerHTML += row;
                    }
                    
                }
            } else {
                let color = card.colors; // colors will only be one color in this case
                let rentValues = properties.get(color);
                div.style.backgroundColor = color;
                rentValues.forEach(rentValue => {
                    rent.innerHTML += '$' + rentValue + "<br>";
                });
            }
            div.appendChild(rent);
            break;
        case "money":
            let center = document.createElement('p');
            center.classList.add('card-money');
            center.innerText = '$' + card.value;
            div.appendChild(center);
            break;
    }

    let blv = document.createElement('p');
    blv.classList.add('value');
    blv.classList.add('value-left');
    blv.innerText = '$' + card.value;
    let brv = document.createElement('p');
    brv.classList.add('value');
    brv.classList.add('value-right');
    brv.innerText = '$' + card.value;
    div.appendChild(blv);
    div.appendChild(brv);

    return div;
}