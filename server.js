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

const rsaWrapper = require('./components/rsa-wrapper');

mongoose.set('useFindAndModify', false);

const Message = require('./models/message');
const Chat = require('./models/chat');

app.use(bodyParser.json());


app.use('/chat', chatsRouter);
app.use('/auth', loginRouter);
app.use('/search', searchRouter);
app.use('/token', tokenRouter);


const IO = io(http);

IO
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

    let currentRoom = null;
    let loadKeys = false;

    const generateAndSendKeys = (chatId, userId) => {
      Promise.all([
        Promise.resolve(rsaWrapper.generate(__dirname, chatId, userId)),
        Promise.resolve(rsaWrapper.initLoadServerKeys(__dirname, chatId, userId)),
      ]).then(() => {
        loadKeys = true;
        socket.emit('DESTINATION_PUBLIC_KEY',
          {
            chatId,
            key: rsaWrapper[`${chatId}${userId}public`].toString()
          });
      });
    };

    socket.on('GET_DESTINATION_PUBLIC_KEY', ({ chatId, userPublicKey }) => {
      const { _id: userId } = socket.decoded;

      Chat
        .findOne({ _id: chatId })
        .then((chat) => {
          chat.userKeys.set(userId, userPublicKey);
          chat
            .save()
            .then(() => {
              generateAndSendKeys(chatId, userId);
            });
        });
    });

    // socket.on('typing', data => {
    //   socket.broadcast.emit('notifyTyping', {
    //     user: data.user,
    //     message: data.message
    //   });
    // });

    // socket.on('stop_typing', () => {
    //   socket.broadcast.emit('notifyStopTyping');
    // });

    const joinRoom = (chatId) => {
      currentRoom && socket.leave(currentRoom);
      currentRoom = chatId;
      socket.join(currentRoom);
      console.log('user joined room', chatId);
      // socket.to(socket.id).emit('ROOM_JOINED', currentRoom);
      // socket.to(currentRoom).emit('NEW_CONNECTION', null);
    };

    socket.on('GET_CURRENT_CHAT', async ({ chatId }) => {
      const { _id: userId } = socket.decoded;

      if (!loadKeys) {
        await Promise.resolve(rsaWrapper.initLoadServerKeys(__dirname, chatId, userId));
      }

      Chat
        .findOne(
          { _id: chatId }
        )
        .populate({ path: 'messages', populate: { path: 'user' } })
        .then((res) => {
          if (res._doc.messages.length > 0) {

            let encryptMessagesPromises = res._doc.messages.map(message => {
              return Promise.resolve(
                rsaWrapper.encrypt(
                  Buffer.from(res._doc.userKeys.get(userId)),
                  rsaWrapper.decrypt(
                    Buffer.from(
                      rsaWrapper[`${message.chatId}${message.user._id}private`]
                    ),
                    message.text
                  )
                )
              ).then(e => {
                return {
                  ...message._doc,
                  text: e
                };
              });
            });

            Promise.all(encryptMessagesPromises).then(enc => {
              socket.emit('SET_CURRENT_CHAT', { ...res._doc, messages: enc });
            });
          } else {
            socket.emit('SET_CURRENT_CHAT', { ...res._doc, messages: [] });
          }
          joinRoom(chatId);
        });
    });

    socket.on('send_message', message => {
      const { _id } = socket.decoded;
      const { text, chatId } = message;

      const chatMessage = new Message({
        text,
        user: _id,
        chatId
      });

      chatMessage
        .save()
        .then(message => {
          Chat
            .findOneAndUpdate(
              { _id: chatId },
              { $push: { messages: message._id } },
              { new: true }
            ).then((chat) => {
              Message
                .findOne({ _id: message._id })
                .populate('user')
                .then((msg) => {
                  Promise.resolve(
                    rsaWrapper.encrypt(
                      Buffer.from(chat._doc.userKeys.get(_id)),
                      rsaWrapper.decrypt(
                        Buffer.from(
                          rsaWrapper[`${chatId}${_id}private`]
                        ),
                        text
                      ))
                  ).then(res => {
                    socket.emit(
                      'new_message',
                      { ...msg._doc, text: res }
                    );
                  });
                });
            });
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
