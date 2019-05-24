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

//database connection
const Chat = require("./models/chat");
const connect = require("./dbconnect");


// app.use(session({
//   secret: 'i need more beers',
//   resave: false,
//   saveUninitialized: true,
//   store: new MongoStore({
//     url: 'mongodb://localhost:27017/chat/users'
//   })
// }));

app.use(bodyParser.json());

//routes
app.use("/chats", chatRouter);
app.use("/login", loginRouter);

//integrating socketio
socket = io(http);



//setup event listener
socket.on("connection", socket => {
  console.log("user connected");

  socket.on("disconnect", function () {
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

  socket.on("login", () => {
    connect.then(db => {
      const data = Chats.find({ message: "Anonymous" });
      Chats.find({}).then(chat => {
        socket.emit("set messages", chat);
      });
    });
  });

  socket.on("send message", function (msg) {
    //broadcast message to everyone in port:5000 except yourself.
    socket.broadcast.emit("received", { message: msg });

    //save chat to the database
    connect.then(db => {
      const chatMessage = new Chat({
        text: msg,
        user: {
          _id: '123',
          name: 'Valera'
        }
      });

      return chatMessage.save();

    }).then(() => {
      connect.then(db => {
        const data = Chats.find({ message: "Anonymous" });
        Chats.find({}).then(chat => {
          socket.emit("set messages", chat);
        });
      });
    });
  });
});


http.listen(port, () => {
  console.log("Running on Port: " + port);
});