const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken')
const randtoken = require('rand-token');
const config = require('../config');
const router = express.Router();
const User = require('../models/user')

let refreshTokens = {}
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
        const { token, refreshToken } = generateToken(user)

        res.json({
          _token: token,
          _id: user._id,
          name: user.name,
          success: true,
          message: 'Authentication successful!',
          refreshToken
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
        const { token, refreshToken } = generateToken(user)

        res.json({
          _token: token,
          _id: user._id,
          name: user.name,
          success: true,
          message: 'Regisration successful!',
          refreshToken
        });

      } else {
        return next(new Error('err'));
      }
    })
    .catch((error) => {
      return next(error);
    });
});

router.route('/token').post((req, res, next) => {
  const refreshToken = req.body.refreshToken
  const user = {
    name: req.body.name,
    _id: req.body._id
  }

  if ((refreshToken in refreshTokens) && (refreshTokens[refreshToken] == req.body.name)) {
    const { token, refreshToken } = generateToken(user)
    res.json({
      _token: token,
      _id: user._id,
      name: user.name,
      success: true,
      message: 'Refresh token successful!',
      refreshToken
    });
  }
  else {
    res.sendStatus(401)
  }
})

router.route('/token/reject').post((req, res, next) => {
  const refreshToken = req.body.refreshToken
  if (refreshToken in refreshTokens) {
    delete refreshTokens[refreshToken]
  }
  res.sendStatus(204)
})

router.route('/logout').post((req, res, next) => {
  //TODO: implement logic
});

function generateToken(user) {
  const refreshToken = randtoken.uid(256);
  const token = jwt.sign({ _id: user._id, name: user.name }, config.SECRET_KEY, { expiresIn: 30 });
  refreshTokens[refreshToken] = user.name

  return { token, refreshToken };
}

function encrypt(text) {
  let key = crypto.createCipher('aes-128-cbc', 'key');
  let string = key.update(text, 'utf8', 'hex')
  string += key.final('hex');
  return string;
}

module.exports = router;