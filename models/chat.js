const mongoose = require('mongoose');
const CONFIG = require('../config');

const Schema = mongoose.Schema;

const chatSchema = new Schema(
    {
        messages: [{
            type: Schema.Types.ObjectId,
            ref: CONFIG.DB_MODELS.MESSAGE
        }]
    },
    {
        timestamps: true
    });

const Chat = mongoose.model(CONFIG.DB_MODELS.CHAT, chatSchema);
module.exports = Chat;