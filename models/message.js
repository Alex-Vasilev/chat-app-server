const mongoose = require('mongoose');
const CONFIG = require('../config');

const Schema = mongoose.Schema;

const messageSchema = new Schema(
    {
        text: String,
        user: {
            type: Schema.Types.ObjectId,
            ref: CONFIG.DB_MODELS.USER
        },
        chatId: Schema.Types.ObjectId,
    },
    {
        timestamps: true
    });

const Message = mongoose.model(CONFIG.DB_MODELS.MESSAGE, messageSchema);
module.exports = Message;