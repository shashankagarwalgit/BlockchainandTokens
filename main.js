const { BlockChain, Transaction, shashankaddress } = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');


const myKey = ec.keyFromPrivate('bd3b81c0ae2e08fe4c60453ea41cd5b74fe5892b0b11d9945c2f41da064a7cab');

const myWalletAddress = myKey.getPublic('hex');

let shaCoin = new BlockChain();
while(shaCoin.getBalanceOfAddress(myWalletAddress) < 0.09) {
    shaCoin.minePendingTransactions(myWalletAddress);
}
console.log(shaCoin.getBalanceOfAddress(myWalletAddress));

// if (shaCoin.getBalanceOfAddress(myWalletAddress) >= 10) {
//     shaCoin.addData("i am shashank agarwal storing data in blockchain");
//     console.log(shaCoin.getLatestBlock());
//     var tx1 = new Transaction(myWalletAddress, systemKey.getPublic('hex'), 10);
//     tx1.signTransaction(myKey);
//     shaCoin.addTransaction(tx1);
//     console.log("Transaction added");
//     console.log(shaCoin.getLatestBlock());
// }

// var tx1 = new Transaction(myWalletAddress, shashankaddress.getPublic('hex'), 10);
// tx1.signTransaction(myKey);
// shaCoin.addTransaction(tx1);
// console.log("Transaction added");
// console.log(shaCoin.getLatestBlock());

shaCoin.sendMoney(shashankaddress, shashankaddress.getPublic('hex'),myWalletAddress, 0.1);
console.log(shaCoin.getBalanceOfAddress(myWalletAddress));
console.log(shaCoin.getBalanceOfAddress(shashankaddress.getPublic('hex')));




