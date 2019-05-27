const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const messageSchema = new Schema(
    {
        text: String,
        user: {
            _id: String,
            name: String
        }
    },
    {
        timestamps: true
    });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;