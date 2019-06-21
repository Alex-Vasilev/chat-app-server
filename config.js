const CONFIG = {
    API_KEY: process.env.ACCOUNT_SECURITY_API_KEY,
    SECRET_KEY: 'supersecret',
    URL: 'mongodb://localhost:27017/chat',
    PORT: process.env.PORT,
    // TODO: need to improve (to DB)
    REFRESH_TOKENS: {},
    DB_MODELS: {
        USER: 'User',
        MESSAGE: 'Message',
        CHAT: 'Chat'
    }
};

module.exports = CONFIG;