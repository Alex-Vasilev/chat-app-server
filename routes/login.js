const express = require('express');
const crypto = require('crypto');
const generateToken = require('../utils/generate-token');

const router = express.Router();
const User = require('../models/user');
const connect = require('../dbconnect');

const encrypt = (text) => {
  const key = crypto.createCipher('aes-128-cbc', 'key');
  let string = key.update(text, 'utf8', 'hex');
  string += key.final('hex');
  return string;
};

// TODO: to middlewares
const checkUser = (userData) => {
  return User
    .findOne({ name: userData.name })
    .populate('chats')
    .then((doc) => {
      if (doc.password == encrypt(userData.password)) {
        return Promise.resolve(doc);
      } else {
        return Promise.reject('Error wrong');
      }
    })
    .catch(() => console.log('User not found'));
};

router.route('/login').post((req, res, next) => {
  connect
    .then(() => {
      checkUser(req.body)
        .then(user => {
          if (user) {
            const { token, refreshToken } = generateToken(user);

            res.json({
              ...JSON.parse(JSON.stringify(user)),
              _token: token,
              refreshToken,
              success: true,
              message: 'Authentication successful!',
            });

          } else {
            return next(new Error('err'));
          }
        })
        .catch((error) => {
          return next(error);
        });
    });
});

router.route('/registration').post((req, res, next) => {
  const newUser = new User({
    name: req.body.name,
    password: encrypt(req.body.password)
  });

  newUser
    .save()
    .then(user => {
      if (user) {
        const { token, refreshToken } = generateToken(user);

        res.json({
          ...JSON.parse(JSON.stringify(user)),
          _token: token,
          refreshToken,
          success: true,
          message: 'Regisration successful!',
        });
      } else {
        return next(new Error('err'));
      }
    })
    .catch((error) => {
      return next(error);
    });
});

router.route('/logout').post(() => {
  //TODO: implement logic
});

module.exports = router;