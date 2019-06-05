const CONFIG = {
    SECRET_KEY: 'supersecret',
    URL: 'mongodb://localhost:27017/chat',
    PORT: 5000,
    // TODO: need to improve (to DB)
    REFRESH_TOKENS: {},
    DB_MODELS: {
        USER: 'User',
        MESSAGE: 'Message',
        CHAT: 'Chat'
    }
};

module.exports = CONFIG;