const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const chatSchema = new Schema(
    {
        users: Array,
    },
    {
        timestamps: true
    });

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;