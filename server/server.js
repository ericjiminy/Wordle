// import modules
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const fs = require('fs');



// express handles server
const app = express();

// give server access to client files
const clientPath = `${__dirname}/../client`;
app.use(express.static(clientPath));
console.log(`Serving static from ${clientPath}`);



// create server and io
const port = process.env.PORT || 8080;
const server = http.createServer(app);
const io = socketio(server);



// read file into array
function read(filename) {
    const filePath = `${__dirname}/../client/` + filename;
    return arr = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
}

// send "words" + "allowedGuesses" to client
io.on("connection", (sock) => {

    sock.on("message", (filename) => {
        sock.emit('message', read(filename));
    });
});



// start server
server.on("error", (error) => {
    console.error("Server error: " + error);
});
server.listen(port, () => {
    console.log("Wordle started on 8080");
});