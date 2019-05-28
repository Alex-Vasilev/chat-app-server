const express = require("express");
const Chats = require("../models/chat");
const router = express.Router();
const checkToken = require('../middlewares/check-token')


router.use(checkToken)

router.post('/', function (req, res, next) {
    Chats.find({})
        .then(chats => {
            return res.json(chats)
        })
});

module.exports = router;