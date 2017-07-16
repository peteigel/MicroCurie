const RSA = require('../../../dist/security/rsa');
const assert = require('assert');

describe('RSA', function() {
    describe('generateKeyPair()', function() {
        it('seems to work...', async function() {
            const keyPair = await RSA.generateKeyPair(1024);
            
            const pubKeyHeader = keyPair.publicKey.key.substring(0, 26);
            assert.equal(pubKeyHeader, '-----BEGIN PUBLIC KEY-----');

            const privKeyHeader = keyPair.privateKey.key.substring(0, 31);
            assert.equal(privKeyHeader, '-----BEGIN RSA PRIVATE KEY-----')
        });

        it('Decrypts what it encrypts', async function () {
            const keyPair = await RSA.generateKeyPair(1024);

            const secret = { message: 'Hello RSA' };
            const encrypted = keyPair.publicKey.encryptJSON(secret);
            const decrypted = keyPair.privateKey.decryptJSON(encrypted);

            assert.equal(decrypted.message, secret.message);
        });
    });
});