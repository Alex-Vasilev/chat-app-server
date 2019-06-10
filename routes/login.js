const express = require('express');
const generateToken = require('../utils/generate-token');

const router = express.Router();
const User = require('../models/user');
const connect = require('../dbconnect');


router.route('/login').post((req, res, next) => {
  connect
    .then(() => {

      User
        .findOne({ name: req.body.name })
        .populate({
          path: 'chats',
          populate: {
            path: 'messages',
            populate: 'user'
          }
        })
        .then(user => {
          user.comparePassword(req.body.password, function (err, isMatch) {
            if (err) {
              throw err;
            }

            if (isMatch) {
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
          });
        })
        .catch((error) => {
          return next(error);
        });
    });
});

router.route('/registration').post((req, res, next) => {
  const newUser = new User({
    name: req.body.name,
    password: req.body.password
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
