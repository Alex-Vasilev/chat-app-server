const express = require("express");
const Users = require("../models/user");
const router = express.Router();
const checkToken = require('../middlewares/check-token')


router.use(checkToken)

router.post('/', function (req, res, next) {
    Users.find({ name: req.body.name })
        .then(user => {
            return res.json({
                id: user._id,
                name: user.name
            })
        })
});

module.exports = router;