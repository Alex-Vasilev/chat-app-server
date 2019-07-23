const express = require('express');
const Client = require('authy-client').Client;
const CONFIG = require('../config');

const authy = new Client({ key: CONFIG.API_KEY });
const generateToken = require('../utils/generate-token');

const router = express.Router();
const User = require('../models/user');


router.route('/login').post((req, res, next) => {
  const { name, password, isTwoFA } = req.body;

  User
    .findOne({ name })
    .populate('chats')
    .exec((err, user) => {
      user.comparePassword(password,
        (err, isMatch) => {
          if (err) {
            throw err;
          }

          if (isMatch) {
            if (isTwoFA) {
              res.json({
                ...user._doc,
                success: true,
              });
            } else {
              const { token, refreshToken } = generateToken(user);
              res.json({
                ...user._doc,
                _token: token,
                refreshToken,
                success: true,
                message: 'Login successful!',
              });
            }

          } else {
            return next(new Error('err'));
          }
        });
    });
});

router.route('/registration').post((req, res) => {
  const { name, password, email, countryCode, phone, isTwoFA } = req.body;

  User
    .findOne({ name })
    .exec((err, user) => {
      if (err) {
        res.json(err);
        return;
      }

      if (user) {
        res.json({ err: "Username Already Registered" });
        return;
      }

      authy.registerUser({
        countryCode,
        email,
        phone
      }, (err, regRes) => {
        if (err) {
          res.json(err);
          return;
        }

        const newUser = new User({
          name,
          password,
          email,
          authyId: regRes.user.id,
          isOnline: true
        });

        newUser.save((err, savedUser) => {
          if (err) {
            res.json(err);
          } else {
            if (isTwoFA) {
              res.json({
                ...savedUser._doc,
                success: true,
              });
            } else {
              const { token, refreshToken } = generateToken(savedUser);

              res.json({
                ...savedUser._doc,
                _token: token,
                refreshToken,
                success: true,
                message: 'Regisration successful!',
              });
            }
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
          });
    });
});

router.route('/logout').post(() => {

});

module.exports = router;
