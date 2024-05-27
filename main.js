const { BlockChain,systemaddress, shashankaddress } = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const fs = require('fs');


const myKey = ec.keyFromPrivate('bd3b81c0ae2e08fe4c60453ea41cd5b74fe5892b0b11d9945c2f41da064a7cab');

const myWalletAddress = myKey.getPublic('hex');

let shaCoin = new BlockChain();
if(fs.existsSync('blockchain.json')) {
    shaCoin.chain = JSON.parse(fs.readFileSync('blockchain.json'));
}

// while(shaCoin.getBalanceOfAddress(myWalletAddress) < 10) {
//     if(shaCoin.getBalanceOfAddress(systemaddress.getPublic('hex')) <= 0) {
//         console.log("No mining can be entertained as all coins are mined");
//         process.exit(0);
//     }
//     shaCoin.minePendingTransactions(myWalletAddress);
//     console.log(shaCoin.getLatestBlock());
// }
// console.log(shaCoin.getBalanceOfAddress(myWalletAddress));

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
console.log(shaCoin.getBalanceOfAddress(shashankaddress.getPublic('hex')));

shaCoin.sendMoney(shashankaddress, shashankaddress.getPublic('hex'),myWalletAddress, 0.01);
console.log(shaCoin.getBalanceOfAddress(myWalletAddress));
console.log(shaCoin.getBalanceOfAddress(shashankaddress.getPublic('hex')));
fs.writeFileSync('blockchain.json', JSON.stringify(shaCoin.chain,null,4));
console.log(shaCoin.getLatestBlock());





