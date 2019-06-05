const mongoose = require('mongoose');
const CONFIG = require('../config');

const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        email: {
            type: String
        },
        chats: [{
            type: Schema.Types.ObjectId,
            ref: CONFIG.DB_MODELS.CHAT
        }]
    },
    {
        toJSON: {
            transform: function (doc, ret) {
                delete ret.password;
            }
        },
        timestamps: true
    });

const User = mongoose.model(CONFIG.DB_MODELS.USER, userSchema);
module.exports = User;