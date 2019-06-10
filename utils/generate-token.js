const jwt = require('jsonwebtoken');
const randtoken = require('rand-token');
const CONFIG = require('../config');


const generateToken = (user) => {
    const refreshToken = randtoken.uid(256);
    const token = jwt.sign(
        { _id: user._id, name: user.name },
        CONFIG.SECRET_KEY,
        { expiresIn: 30 }
    );
    CONFIG.REFRESH_TOKENS[refreshToken] = user.name;

    return { token, refreshToken };
};

module.exports = generateToken;