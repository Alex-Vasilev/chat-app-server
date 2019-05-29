const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const searchRouter = require('./routes/search');
const chatsRouter = require('./routes/chats');
const jwt = require('jsonwebtoken')

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
app.use('/chat', chatsRouter);
app.use('/auth', loginRouter);
app.use('/search', searchRouter);


//integrating socketio
socket = io(http);


//setup event listener
socket
  .use((socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token) {
      jwt.verify(
        socket.handshake.query.token,
        'supersecret',
        (err, decoded) => {
          if (err) {
            return next(new Error('Authentication error'))
          }
          socket.decoded = decoded;
          next();
        });
    } else {
      next(new Error('Authentication error'));
    }
  })
  .on('connection', socket => {
    console.log('user connected');

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

    socket.on('typing', data => {
      socket.broadcast.emit('notifyTyping', {
        user: data.user,
        message: data.message
      });
    });

    socket.on('stop_typing', () => {
      socket.broadcast.emit('notifyStopTyping');
    });

    socket.on('get_messages', chatId => {
      Message
        .find({ chatId })
        .then(messages => {
          socket.emit('set_messages', messages);
        })
    });

    socket.on('send_message', message => {
      //broadcast message to everyone in port:5000 except yourself.
      // socket.broadcast.emit('received', { message });

      const chatMessage = new Message(message);

      return chatMessage.save();
    });
  });


http.listen(port, () => {
  console.log('Running on Port: ' + port);
});