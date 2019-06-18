require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const http = require('http').Server(app);
const io = require('socket.io');
const tokenRouter = require('./routes/token');
const searchRouter = require('./routes/search');
const chatsRouter = require('./routes/chats');
const CONFIG = require('./config');
const loginRouter = require('./routes/login');
mongoose.Promise = require('bluebird');


const Message = require('./models/message');
const Chat = require('./models/chat');

app.use(bodyParser.json());


app.use('/chat', chatsRouter);
app.use('/auth', loginRouter);
app.use('/search', searchRouter);
app.use('/token', tokenRouter);


const socket = io(http);

socket
  .use((socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token) {
      jwt.verify(
        socket.handshake.query.token,
        CONFIG.SECRET_KEY,
        (err, decoded) => {
          if (err) {
            return next(new Error('Authentication error'));
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

    socket.on('send_message', message => {
      // socket.broadcast.emit('received', { message });

      const chatMessage = new Message({
        text: message.text,
        user: socket.decoded._id,
        chatId: message.chatId
      });

      chatMessage
        .save()
        .then(message => {
          Chat
            .updateMany(
              { _id: message.chatId },
              { $push: { messages: message._id } }
            ).then(() => {
              Message
                .find({ _id: message._id })
                .populate('user')
                .then((msg) => {
                  socket.emit('new_message', msg);
                });
            }
            );
        });
    });
  });


mongoose.connect(CONFIG.URL, { useNewUrlParser: true });
const db = mongoose.connection;

db.once('open', function (err) {
  if (err) {
    console.log("Error Opening the DB Connection: ", err);
    return;
  }
  http.listen(CONFIG.PORT, () => {
    console.log('Running on Port: ' + CONFIG.PORT);
  });
});
