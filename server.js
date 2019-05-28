const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const searchRouter = require('./routes/search');
const conversationsRouter = require('./routes/conversations');

const loginRouter = require('./routes/login');
const http = require('http').Server(app);
const io = require('socket.io');

const port = 5000;

//database connection
const Chat = require('./models/chat');
const Message = require('./models/message');
const User = require('./models/user');
const connect = require('./dbconnect');


app.use(bodyParser.json());

//routes
app.use('/conversations', conversationsRouter);
app.use('/auth', loginRouter);
app.use('/search', searchRouter);


//integrating socketio
socket = io(http);


//setup event listener
socket.use((socket, next) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    jwt.verify(
      socket.handshake.query.token,
      'supersecret',
      (err, decoded) => {
        if (err) return next(new Error('Authentication error'));
        socket.decoded = decoded;
        next();
      });
  } else {
    next(new Error('Authentication error'));
  }

}).on('connection', socket => {
  console.log('user connected');

  socket.on('disconnect', function () {
    console.log('user disconnected');
  });

  socket.on('typing', data => {
    socket.broadcast.emit('notifyTyping', {
      user: data.user,
      message: data.message
    });
  });

  socket.on('stopTyping', () => {
    socket.broadcast.emit('notifyStopTyping');
  });

  socket.on('login', () => {
    connect.then(db => {

    });
  });

  socket.on('send message', function (msg) {
    //broadcast message to everyone in port:5000 except yourself.
    socket.broadcast.emit('received', { message: msg });

    //save message to the database
    connect.then(db => {
      const chatMessage = new Message({
        text: msg,
        user: {
          _id: '123',
          name: 'Valera'
        }
      });

      return chatMessage.save();

    }).then(() => {
      connect.then(db => {
        Message.find({}).then(message => {
          socket.emit('set messages', message);
        });
      });
    });
  });
});


http.listen(port, () => {
  console.log('Running on Port: ' + port);
});