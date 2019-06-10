const express = require('express');
const CONFIG = require('../config');

const router = express.Router();
const generateToken = require('../utils/generate-token');



router.route('/').post((req, res) => {
    const refreshToken = req.body.refreshToken;
    const user = {
        name: req.body.name,
        _id: req.body._id
    };

    if ((refreshToken in CONFIG.REFRESH_TOKENS)
        && (CONFIG.REFRESH_TOKENS[refreshToken] == req.body.name)) {

        const { token, refreshToken } = generateToken(user);

        res.json({
            _token: token,
            _id: user._id,
            name: user.name,
            success: true,
            message: 'Refresh token successful!',
            refreshToken
        });
    }
    else {
        res.sendStatus(401);
    }
});

// TODO: hard removal 

router.route('/reject').post((req, res) => {
    const refreshToken = req.body.refreshToken;
    if (refreshToken in CONFIG.REFRESH_TOKENS) {
        delete CONFIG.REFRESH_TOKENS[refreshToken];
    }
    res.sendStatus(204);
});


module.exports = router;