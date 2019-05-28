const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken')

const router = express.Router();
const User = require('../models/user')

// TODO: to middlewares
function checkUser(userData) {
  return User
    .findOne({ name: userData.name })
    .then(function (doc) {
      if (doc.password == encrypt(userData.password)) {
        return Promise.resolve(doc)
      } else {
        return Promise.reject('Error wrong')
      }
    })
    .catch(e => console.log('User not found'))
}

router.route('/login').post((req, res, next) => {
  checkUser(req.body)
    .then(user => {
      if (user) {
        const token = generateToken(user)

        res.json({
          _token: token,
          _id: user._id,
          name: user.name,
          success: true,
          message: 'Authentication successful!',
        });

      } else {
        return next(new Error('err'));
      }
    })
    .catch((error) => {
      return next(error);
    })

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
        const token = generateToken(user)

        res.json({
          _token: token,
          _id: user._id,
          name: user.name,
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

router.route('/logout').post((req, res, next) => {
  //TODO: implement logic
});

function generateToken(user) {
  return jwt.sign({ _id: user._id, name: user.name }, 'supersecret');
}

function encrypt(text) {
  let key = crypto.createCipher('aes-128-cbc', 'key');
  let string = key.update(text, 'utf8', 'hex')
  string += key.final('hex');
  return string;
}

module.exports = router;