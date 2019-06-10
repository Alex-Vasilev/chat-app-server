const mongoose = require('mongoose');
const CONFIG = require('./config');
mongoose.Promise = require('bluebird');


const connect = mongoose.connect(CONFIG.URL, { useNewUrlParser: true });

module.exports = connect;