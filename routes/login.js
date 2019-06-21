const express = require('express');
const Client = require('authy-client').Client;
const CONFIG = require('../config');

const authy = new Client({ key: CONFIG.API_KEY });
const generateToken = require('../utils/generate-token');

const router = express.Router();
const User = require('../models/user');


router.route('/login').post((req, res, next) => {
  const { name } = req.body;

  User
    .findOne({ name })
    .populate({
      path: 'chats',
      populate: {
        path: 'messages',
        populate: { path: 'user' }
      }
    })
    .then((user) => {

      user.comparePassword(req.body.password,
        (err, isMatch) => {
          if (err) {
            throw err;
          }

          if (isMatch) {

            res.json({
              ...JSON.parse(JSON.stringify(user)),
              success: true
            });

          } else {
            return next(new Error('err'));
          }
        });
    })
    .catch(e => console.log(e));

});

router.route('/registration').post((req, res) => {
  const { name, password, email } = req.body;

  User.findOne({ name }).exec((err, user) => {
    if (err) {
      res.json(err);
      return;
    }

    if (user) {
      res.json({ err: "Username Already Registered" });
      return;
    }

    authy.registerUser({
      countryCode: req.body.countryCode,
      email,
      phone: req.body.phoneNumber
    }, (err, regRes) => {
      if (err) {
        res.json(err);
        return;
      }

      const newUser = new User({
        name,
        password,
        email,
        authyId: regRes.user.id
      });

      newUser.save((err, usr) => {
        if (err) {
          res.json(err);
        } else {
          res.json({
            ...JSON.parse(JSON.stringify(usr)),
            success: true,
          });
        }
      });
    });
  });
});

router.route('/sms').post((req, res) => {
  const name = req.body.name;
  User
    .findOne({ name })
    .exec((err, user) => {

      if (err) {
        res.json(err);
        return;
      }

      authy.requestSms(
        { authyId: user.authyId },
        { force: true }, // Passing force: true forces an SMS send.
        (err, smsRes) => {
          if (err) {
            res.json(err);
            return;
          }

          res.json(smsRes);
        });
    });
});

router.route('/verify').post((req, res) => {
  const { name } = req.body;

  User
    .findOne({ name })
    .exec((err, user) => {

      if (err) {
        res.json(err);
      }

      authy
        .verifyToken({ authyId: user.authyId, token: req.body.token },
          (err) => {
            if (err) {

              res.json(err);
              return;
            }

            const { token, refreshToken } = generateToken(user);
            res.json({
              _token: token,
              refreshToken,
            });
            // res.json(tokenRes);
          });
    });
});

router.route('/logout').post(() => {
  //TODO: implement logic
});

module.exports = router;
