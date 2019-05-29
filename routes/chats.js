const express = require("express");
const Chats = require("../models/chat");
const router = express.Router();
const checkToken = require('../middlewares/check-token')


router.use(checkToken)

router.post('/', function (req, res, next) {
    Chats
        .find({})
        .then(chats => {
            return res.json(chats)
        })
});

router.post('/new', function (req, res, next) {
    const chat = new Chats({
        users: [req.body.userId, req.body.recieverId]
    });

    chat
        .save()
        .then(chat => {
            return res.json(chat)
        });
});

module.exports = router;