const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


function Card(type, value, title="untitled", description="no description", colors=false) {
    this.type = type;  // can be action, money, property  
    this.value = value;
    this.title = title;
    this.description = description;
    this.colors = colors; // corresponds to rent colors if it's a rent card, or property colors if it is a property card.
}

let properties = new Map();
properties.set("black", [1, 2, 3, 4]);
properties.set("brown", [1, 2]);
properties.set("light_green", [1, 2]);
properties.set("purple", [1, 2, 4]);
properties.set("light_blue", [1, 2, 3]);
properties.set("orange", [1, 3, 5]);
properties.set("red", [2, 3, 6]);
properties.set("yellow", [2, 4, 6]);
properties.set("green", [2, 4, 7]);
properties.set("blue", [3, 8]);

function Deck() {
    this.cards = [];
    this.add("money", 10, 1);
    this.add("money", 5, 2);
    this.add("money", 4, 3);
    this.add("money", 3, 3);
    this.add("money", 2, 5);
    this.add("money", 1, 6);
    this.add("action", 4, 2, "Hotel", "Place on any of your complete Property sets that has a House to add $4 to rent. The House stays.");
    this.add("action", 3, 3, "House", "Place on any of your complete Property sets to add $3 to rent. May not be placed on Railroads or Utilities");
    this.add("action", 3, 3, "Rent", "Choose one of these colors. Choose one player to pay you rent for all Properties you own in that color.", "red purple orange green yellow light_green brown black light_blue blue");
    this.add("action", 1, 2, "Rent", "Choose one of these colors. All players pay you rent for all Properties you own in that color.", "green blue");
    this.add("action", 1, 2, "Rent", "Choose one of these colors. All players pay you rent for all Properties you own in that color.", "yellow red");
    this.add("action", 1, 2, "Rent", "Choose one of these colors. All players pay you rent for all Properties you own in that color.", "orange purple");
    this.add("action", 1, 2, "Rent", "Choose one of these colors. All players pay you rent for all Properties you own in that color.", "light_green black");
    this.add("action", 1, 2, "Rent", "Choose one of these colors. All players pay you rent for all Properties you own in that color.", "light_blue brown");
    this.add("action", 1, 2, "Double the Rent", "Play with a Rent card. Players must pay you double rent.");
    this.add("action", 1, 10, "Pass Go.", "Draw 2 cards");
    this.add("action", 2, 3, "It's Your Birthday!", "All players give you $2");
    this.add("action", 4, 3, "Just Say No.", "Cancel an action card that is played against you");
    this.add("action", 5, 2, "Deal Breaker", "Steal a complete Property set, including any buildings, from any player. Place it in front of you.");
    this.add("action", 3, 3, "Debt Collector", "Force any player to pay you $5");
    this.add("action", 3, 3, "Sly Deal", "Steal one Property from any player, and place it in front of you. You may not steaal a Property that's part of a complete set");
    this.add("action", 3, 3, "Forced Deal", "Swap any one of your Properties with any one of your opponents' Properties. You may not take a Property that's part of a complete set");
    this.add("property", 0, 2, "Wild Property", "This card may be used as part of any property set", "red purple orange green yellow light_green brown black light_blue blue");
    this.add("property", 2, 1, "B. & O. Railroad", "1 2 3 4", "black");
    this.add("property", 2, 1, "Pennsylvania Railroad", "1 2 3 4", "black");
    this.add("property", 2, 1, "Reading Railroad", "1 2 3 4", "black");
    this.add("property", 2, 1, "Short Line", "1 2 3 4", "black");
    this.add("property", 4, 1, "Boardwalk", "3 8", "blue");
    this.add("property", 4, 1, "Park Place", "3 8", "blue");
    this.add("property", 4, 1, "North Carolina Avenue", "2 4 7", "green")
    this.add("property", 4, 1, "Pacific Avenue", "2 4 7", "green")
    this.add("property", 4, 1, "Pennsylvania Avenue", "2 4 7", "green")
    this.add("property", 3, 1, "Marvin Gardens", "2 4 6", "yellow");
    this.add("property", 3, 1, "Atlantic Avenue", "2 4 6", "yellow");
    this.add("property", 3, 1, "Ventnor Avenue", "2 4 6", "yellow");
    this.add("property", 3, 1, "Indiana Avnenue", "2 3 6", "red");
    this.add("property", 3, 1, "Kentucky Avnenue", "2 3 6", "red");
    this.add("property", 3, 1, "Illinois Avnenue", "2 3 6", "red");
    this.add("property", 2, 1, "New York Avenue", "1 3 5", "orange");
    this.add("property", 2, 1, "St. James Place", "1 3 5", "orange");
    this.add("property", 2, 1, "Tennessee Avenue", "1 3 5", "orange");
    this.add("property", 1, 1, "Connecticut Avenue", "1 2 3", "light_blue");
    this.add("property", 1, 1, "Vermont Avenue", "1 2 3", "light_blue");
    this.add("property", 1, 1, "Oriental Avenue", "1 2 3", "light_blue");
    this.add("property", 2, 1, "Virginia Avenue", "1 2 4", "purple");
    this.add("property", 2, 1, "States Avenue", "1 2 4", "purple");
    this.add("property", 2, 1, "St. Charles Place", "1 2 4", "purple");
    this.add("property", 2, 1, "Electric Company", "1 2", "light_green");
    this.add("property", 2, 1, "Water Works", "1 2", "light_green");
    this.add("property", 2, 1, "Mediterranean Avenue", "1 2", "brown");
    this.add("property", 2, 1, "Baltic Avenue", "1 2", "brown");
    this.add("property", 2, 2, "Wild Property", "Choose one color", "orange purple");
    this.add("property", 3, 2, "Wild Property", "Choose one color", "yellow red");
    this.add("property", 2, 2, "Wild Property", "Choose one color", "light_green black");
    this.add("property", 1, 2, "Wild Property", "Choose one color", "light_blue brown");
    this.add("property", 4, 2, "Wild Property", "Choose one color", "light_blue black");
    this.add("property", 4, 2, "Wild Property", "Choose one color", "green black");
    this.add("property", 4, 2, "Wild Property", "Choose one color", "blue green");
}

Deck.prototype.add = function(type, value, count, title="untitled", description="no description", colors=false) {
    for (var i = 0; i < count; i++) {
        this.cards.push(new Card(type, value, title, description, colors));
    }
}

let deck = new Deck();

app.use(express.static(__dirname + '/public_html'))

let gameStarted = false;
let players = [];

function deal(player, count) {
    for (var i = 0; i < count; i++) {
        // select a random card from the deck
        let index = Math.floor(Math.random() * deck.cards.length);
        let card = deck.cards[index];
        deck.cards.splice(index, 1);
        player.hand.push(card);
    }
    io.to(player.socket).emit('player-update', player);
}

function startGame() {
    // emit out to the players that 
    // the game is starting.
    io.to("game").emit('start');
    gameStarted = true;
    setTimeout(() => {
        // deal out cards to all players
        players.forEach(player => {
            deal(player, 5);
        });
    }, 3000);
}

io.on('connection', (socket) => {
    socket.on('join', (username) => {
        // first check if the game has started
        if (gameStarted) {
            io.to(socket.id).emit("join-failure", "The game already started!");
        }
        else if (players.length >= 5) {
            io.to(socket.id).emit("join-failure", "The game is already full!");
        } else {
            // check if the user name is taken
            let taken = false;
            for (var i = 0; i < players.length; i++) {
                if (players[i].username == username) {
                    taken = true;
                    break;
                }
            }
            if (taken) {
                io.to(socket.id).emit("join-failure", "That username is already taken!");
            } else {
                // then we should be ok to add the player
                players.push({socket: socket.id, username: username, hand: [], bank: [], properties: []});
                socket.join("game");
                io.to("game").emit('players', players);
            }
        }
    });
    
    socket.on('start', () => {
        // re ensure that there are enough players
        if (players.length >= 2)
            startGame();
    });

    socket.on('disconnect', () => {
        let found = false;
        // find the player with that socket id
        for (var i = 0; i <  players.length; i++) {
            if (players[i].socket == socket.id) {
                // remove that player
                players.splice(i, 1);
                found = true;
                break;
            }
        }
        if (found)
            io.to('game').emit('players', players);
    });
});




server.listen(3000, () => {
  console.log('listening on *:3000');
});