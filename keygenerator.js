const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const key = ec.genKeyPair();
const pubKey = key.getPublic('hex');
const privKey = key.getPrivate('hex');

console.log('Private key: ', privKey);
console.log('\n Public key: ', pubKey);