const {BlockChain , Transaction} = require('./blockchain');

let shaCoin = new BlockChain();

shaCoin.createTransaction(new Transaction('shashank' , 'pakhi' , 20));
shaCoin.createTransaction(new Transaction('pakhi' , 'shashank' , 5));

console.log(JSON.stringify(shaCoin , null , 4));

console.log("\n Starting mining ....");
shaCoin.minePendingTransactions('shaowner');

shaCoin.minePendingTransactions('shaowner');
console.log("balance of sha-owner: ", shaCoin.getBalanceOfAddress('shaowner'));

