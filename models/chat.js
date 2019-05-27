const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const chatSchema = new Schema(
    {
        user: String,
        reciever: String,
    },
    {
        timestamps: true
    });

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;