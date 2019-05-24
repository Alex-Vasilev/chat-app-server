const express = require("express");
const bodyParser = require("body-parser");
const connectdb = require("./../dbconnect");
const Chats = require("../models/chat");

const router = express.Router();

router.route("/").get((req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;

    connectdb.then(db => {
        const data = Chats.find({ message: "Anonymous" });
        Chats.find({}).then(chat => {
            res.json(chat);
        });
    });
});

module.exports = router;