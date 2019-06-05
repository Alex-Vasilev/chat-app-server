const express = require('express');

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

    socket.on('get_messages', chatId => {
      Message
        .find({ chatId })
        .then(messages => {
          socket.emit('set_messages', messages);
        });
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
            .update(
              { _id: message.chatId },
              { $push: { messages: message._id } }
            );
        });

    });
  });

http.listen(CONFIG.PORT, () => {
  console.log('Running on Port: ' + CONFIG.PORT);
});