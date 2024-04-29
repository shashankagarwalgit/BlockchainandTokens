const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const shashankaddress = ec.keyFromPrivate('94c12671ec82583f668f76cf916d2945707add0c3ba3d37668271b48b2b321c2');

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.signature = this.signature;
    }
    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey) {
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error("you cannot sign transactions to other wallet");
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
        return this.signature;
    }

    isValid() {
        if (this.fromAddress === null) { return true }

        if (!this.signature || this.signature.length === 0) {
            throw new Error("no signature in this transaction");
        }
        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        publicKey.v
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block {
    constructor(blockNo,timestamp, transactions, prevHash = '') {
        this.blockNo = blockNo;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.prevHash = prevHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return SHA256(this.blockNo + this.prevHash + this.timestamp + JSON.stringify(this.transactions + this.nonce)).toString();
    }
    hexToBinary(hex) {
        return BigInt(`0x${hex}`).toString(2);
    }

    mineBlock(difficulty) {
        while(this.hexToBinary(this.hash).substring(128, 128+(difficulty)) !== Array(difficulty+1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("Block mined:  " + this.hash);
        // console.log("Solution find at: " + this.nonce);
    }
    hasValidTransactions() {
        for (const tx of this.transactions) {
            if (!tx.isValid()) {
                return false;
            }
        }
        return true;
    }
}

class BlockChain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.pendingTransactions = [];
        this.shashankaddress = 1000;
        this.difficulty = 14;
        this.miningReward = 0.023;
    }
    mindiff(){
        return 20;
    }
    createGenesisBlock() {
        return new Block(0,"16/10/2023 21:13", "Genesis Block SHA coin", '0x64');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress) {

        const rewardTx = new Transaction('systembymining', miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(this.chain.length,Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log("Block successfully mined ");
        this.chain.push(block);

        this.pendingTransactions = [];

    }

    addTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }
        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain');
        }
        this.pendingTransactions.push(transaction);
        let block = new Block(this.chain.length,Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(14);

        console.log("Block successfully mined ");
        this.chain.push(block);

        this.pendingTransactions = [];
    }

    addData(data) {
        this.pendingTransactions.push(data);
        let block = new Block(this.chain.length,Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log("Block MINED for Data");
        this.chain.push(block);

    }
    sendMoney(privKey,fromAddress, toAddress, amount) {
        const tx = new Transaction(fromAddress, toAddress, amount);
        tx.signTransaction(privKey);
        this.addTransaction(tx);
        console.log("Transaction send successfully ");
        console.log(tx);
    }

    getBalanceOfAddress(address) {

        var balance = 0.0;
        // if(address === systemKey.getPublic('hex')){
        //     return this.systemKeyBalance;
        // }
        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if (trans.toAddress === address) {
                    balance += trans.amount;
                    // this.shashankaddress += trans.amount;
                }
            }
        }
        if(address === shashankaddress.getPublic('hex')) {
            return this.shashankaddress + balance;
        }
        else{
        return balance;
        }
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (!currentBlock.hasValidTransactions()) {
                return false;
            }

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.prevHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }

}

module.exports.BlockChain = BlockChain;
module.exports.Transaction = Transaction;
module.exports.Block = Block;
module.exports.shashankaddress = shashankaddress;
