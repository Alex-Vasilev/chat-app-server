const express = require("express");
const Users = require("../models/user");

const router = express.Router();
const checkToken = require('../middlewares/check-token');


router.use(checkToken);

router.post('/', function (req, res) {
    Users
        .find({ name: req.body.name })
        .then(users => {
            return res.json(users);
        });
});

module.exports = router;