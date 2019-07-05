const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
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
        }],
        authyId: Number,
        isOnline: Boolean,
    },
    {
        toJSON: {
            transform: function (doc, ret) {
                delete ret.password;
            }
        },
        timestamps: true
    });

userSchema.pre('save', function (next) {
    let user = this;

    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err);
        }

        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) {
                return next(err);
            }
            user.password = hash;
            next();
        });
    });
});

userSchema.methods = {
    comparePassword: function (candidatePassword, cb) {
        bcrypt.compare(
            candidatePassword,
            this.password,
            function (err, isMatch) {
                if (err) {
                    return cb(err);
                }
                cb(null, isMatch);
            });
    }
};

const User = mongoose.model(CONFIG.DB_MODELS.USER, userSchema);
module.exports = User;