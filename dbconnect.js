const mongoose = require('mongoose');
const config = require('./config');
mongoose.Promise = require('bluebird');


const connect = mongoose.connect(config.URL, { useNewUrlParser: true });

module.exports = connect;