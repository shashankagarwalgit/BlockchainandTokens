const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// const key = ec.genKeyPair();
// const pubKey = key.getPublic('hex');
// const privKey = key.getPrivate('hex');

// console.log('Private key: ', privKey);
// console.log('\n Public key: ', pubKey);

const privKey = "21143f6a2c87b55c0a7bfdee5dd119cbd47255a5f666f40241eab98f16f484aa";
const pubKey = "0423bd1ec258a7d458a73bd3a80c7b9d121ab16deabfafc9d1d615f978beee40266a2729f64cb4595b02cad00583f4ef23cb2d5fe86b2c13da1ae8fb78d508dd3d";

// console.log(ec.verify("shashank","3045022035a71301320f3a3f4ae44f70af906bafd26521c2a546ade13d22ed28965de32e02210080c52bed9534a8bfbd7c7702c4c804b3dde16598f081b18d83b5a3a4244bf80b",Buffer.from(pubKey,'hex')));

console.log(ec.keyFromPrivate(privKey).getPublic('hex'));