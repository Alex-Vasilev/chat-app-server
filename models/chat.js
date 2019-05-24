const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const chatSchema = new Schema(
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

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;