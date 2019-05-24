const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const chatRouter = require("./routes/chat");
const loginRouter = require("./routes/login");
const session = require('express-session')
const MongoStore = require('connect-mongo')(session);
const http = require("http").Server(app);
const io = require("socket.io");

const port = 5000;


app.use(session({
    secret: 'i need more beers',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
        url: 'mongodb://localhost:27017/chats'
    })
}));

app.use(bodyParser.json());

//routes
app.use("/chats", chatRouter);
app.use("/login", loginRouter);

//integrating socketio
socket = io(http);

//database connection
const Chat = require("./models/chat");
const connect = require("./dbconnect");

//setup event listener
socket.on("connection", socket => {
  console.log("user connected");

  socket.on("disconnect", function() {
    console.log("user disconnected");
  });

  socket.on("typing", data => {
    socket.broadcast.emit("notifyTyping", {
      user: data.user,
      message: data.message
    });
  });

  socket.on("stopTyping", () => {
    socket.broadcast.emit("notifyStopTyping");
  });

  socket.on("chat message", function(msg) {

    //broadcast message to everyone in port:5000 except yourself.
    socket.broadcast.emit("received", { message: msg });

    //save chat to the database
    connect.then(db => {
      const chatMessage = new Chat({ message: msg, sender: "Anonymous" });

      chatMessage.save();
    });
  });
});


http.listen(port, () => {
  console.log("Running on Port: " + port);
});