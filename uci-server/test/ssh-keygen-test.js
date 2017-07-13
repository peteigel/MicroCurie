const { SSHKeygen } = require('../dist/util/ssh-keygen');

function printHeader(str) {
    const hr = '================';
    console.log(`\n${hr}\n${str}\n${hr}`);
}

async function test() {
    const keygen = new SSHKeygen();
    const keyPair = await keygen.generateKeyPair('test-key');
    
    printHeader('Private Key');
    console.log(keyPair[0]);

    printHeader('Public Key');
    console.log(keyPair[1]);

    const fingerprint = await keygen.calculateFingerprint(keyPair[1]);
    printHeader('Fingerprint');
    console.log(fingerprint);

    await keygen.cleanUp();
}

test().then(() => console.log('\nGreat Success.')).catch(e => { throw e; });