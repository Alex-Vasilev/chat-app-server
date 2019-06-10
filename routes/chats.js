const express = require("express");
const Chats = require("../models/chat");

const router = express.Router();
const checkToken = require('../middlewares/check-token');
const User = require('../models/user');

router.use(checkToken);


router.post('/new', (req, res) => {
    const chat = new Chats({
        messages: [],
    });

    chat
        .save()
        .then(chat => {
            User.updateMany(
                { _id: req.decoded._id },
                { $push: { chats: chat._id } }
            ).then((e) => console.log(e));
            
            User.updateMany(
                { _id: req.body.recieverId },
                { $push: { chats: chat._id } }
            ).then((e) => console.log(e));

            return res.json(chat);
        });
});

module.exports = router;