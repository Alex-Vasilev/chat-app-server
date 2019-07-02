const path = require('path');

const rsaWrapper = {};
const fs = require('fs');
const NodeRSA = require('node-rsa');
const crypto = require('crypto');


rsaWrapper.initLoadServerKeys = (basePath, chatId, userId) => {
    rsaWrapper[`${chatId}${userId}public`] =
        fs.readFileSync(
            path.resolve(
                basePath,
                'keys',
                `${chatId}${userId}server.public.pem`)
        );
    rsaWrapper[`${chatId}${userId}private`] =
        fs.readFileSync(
            path.resolve(
                basePath,
                'keys',
                `${chatId}${userId}server.private.pem`)
        );
};

rsaWrapper.generate = (basePath, chatId, userId) => {
    let key = new NodeRSA();
    key.setOptions({ encryptionScheme: 'pkcs1' });
    key.generateKeyPair(2048, 65537);
    fs.writeFileSync(
        path.resolve(
            basePath,
            'keys',
            `${chatId}${userId}server.private.pem`
        ),
        key.exportKey('pkcs8-private-pem')
    );
    fs.writeFileSync(
        path.resolve(
            basePath,
            'keys',
            `${chatId}${userId}server.public.pem`
        ),
        key.exportKey('pkcs8-public-pem')
    );

    return true;
};

rsaWrapper.serverExampleEncrypt = () => {
    console.log('Server public encrypting');

    let enc = rsaWrapper.encrypt(rsaWrapper.serverPub, 'Server init hello');
    console.log('Encrypted RSA string ', '\n', enc);
    let dec = rsaWrapper.decrypt(rsaWrapper.serverPrivate, enc);
    console.log('Decrypted RSA string ...');
    console.log(dec);
};

rsaWrapper.encrypt = (publicKey, message) => {
    let enc = crypto.publicEncrypt({
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
    }, Buffer.from(message));

    return enc.toString('base64');
};

rsaWrapper.decrypt = (privateKey, message) => {
    let enc = crypto.privateDecrypt({
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
    }, Buffer.from(message, 'base64'));

    return enc.toString();
};

module.exports = rsaWrapper;
