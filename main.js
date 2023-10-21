const {BlockChain , Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('a2d58bf667b9d5269ceb365c0ae5f61e0f025e0ea082feada77a1a40cc16064d');
const myWalletAddress = myKey.getPublic('hex');
// console.log(myWalletAddress);

let shaCoin = new BlockChain();

const tx1 = new Transaction(myWalletAddress , 'shashank' , 10);
tx1.signTransaction(myKey);
shaCoin.addTransaction(tx1);

console.log("\n Starting mining ....");
shaCoin.minePendingTransactions(myWalletAddress);

console.log("\nBalance of myWalletAddress ", shaCoin.getBalanceOfAddress(myWalletAddress));
console.log("\nBalance of shashank " , shaCoin.getBalanceOfAddress('shashank'));
