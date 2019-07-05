const express = require("express");
const Chats = require("../models/chat");

const router = express.Router();
const checkToken = require('../middlewares/check-token');
const User = require('../models/user');

router.use(checkToken);


router.post('/new', (req, res) => {

    const { recieverId } = req.body;
    const { _id } = req.decoded;

    const chat = new Chats({
        messages: [],
        users: [_id, recieverId],
        title: `Chat with ${recieverId}`,
        userKeys: {}
    });

    chat
        .save()
        .then(chat => {
            User.updateMany(
                { _id },
                { $push: { chats: chat._id } }
            ).then((e) => console.log(e));

            User.updateMany(
                { _id: recieverId },
                { $push: { chats: chat._id } }
            ).then((e) => console.log(e));

            return res.json(chat);
        });
});

router.post('/add_user', (req, res) => {
    const { recieverId, chatId } = req.body;

    User
        .findOneAndUpdate(
            { _id: recieverId },
            { $push: { chats: chatId } },
            { new: true }
        )
        .then(() => res.json({ sucsess: true }));
});

module.exports = router;