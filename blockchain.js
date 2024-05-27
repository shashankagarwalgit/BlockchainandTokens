const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const shashankaddress = ec.keyFromPrivate('94c12671ec82583f668f76cf916d2945707add0c3ba3d37668271b48b2b321c2');
const systemaddress = ec.keyFromPrivate('21143f6a2c87b55c0a7bfdee5dd119cbd47255a5f666f40241eab98f16f484aa');

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
    constructor(blockNo, timestamp, transactions, prevHash = '') {
        this.blockNo = blockNo;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.prevHash = prevHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return '0x' + SHA256(SHA256(this.blockNo + this.prevHash + this.timestamp + JSON.stringify(this.transactions + this.nonce)).toString()).toString();
    }
    // hexToBinary(hex) {
    //     return BigInt(`0x${hex}`).toString(2);
    // }
    calculateTarget(difficulty) {
        // For SHA-256, the maximum hash value is (2^256 - 1)
        const hashmax = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
        const MAX_HASH_VALUE = BigInt(hashmax);
        return MAX_HASH_VALUE / BigInt(difficulty);
    }

    mineBlock(difficulty) {
        let target = this.calculateTarget(difficulty);

        while (BigInt(this.hash) >= target) {
            this.nonce++;
            this.hash = '0x' + SHA256(this.calculateHash() + this.nonce).toString();
            // console.log(blockHash); 
            // console.log(BigInt(blockHash));
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
        this.systemaddress = 2300000;
        this.difficulty = 20000;
        this.miningReward = 0.023;
        this.TARGET_BLOCK_TIME = 300; // Target block time in milliseconds (e.g., 10 minutes)
        this.MAX_DIFFICULTY = 1000000;
    }

    createGenesisBlock() {
        return new Block(0, "16/10/2023 21:13", "Genesis Block SHA coin", '0x64');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
    calculateAverageBlockTime(blockchain) {
        const latestBlocks = blockchain.slice(-5); // Get the last 5 blocks
        if (latestBlocks.length === 0) {
            return this.TARGET_BLOCK_TIME; // Use target block time if blockchain is empty
        }
        const totalBlockTime = latestBlocks[4].timestamp - latestBlocks[0].timestamp;
        const averageBlockTime = totalBlockTime / (1000 * latestBlocks.length);
        console.log("Average block time: " + Math.floor(averageBlockTime) + " seconds");
        return Math.floor(averageBlockTime);
    }

    adjustDifficulty(averageBlockTime) {
        var diff = 108;
        // Adjust the difficulty level based on the average block time
        if (averageBlockTime < this.TARGET_BLOCK_TIME) {
            diff = Math.min(this.MAX_DIFFICULTY, this.difficulty + 501); // Increase difficulty if blocks are mined too quickly
            this.difficulty = diff;
        } else {
            diff = Math.max(1, this.difficulty - 50); // Decrease difficulty if blocks are mined too slowly
            this.difficulty = diff;
        }
        return this.difficulty;
    }
    minePendingTransactions(miningRewardAddress) {

        const rewardTx = new Transaction(systemaddress.getPublic('hex'), miningRewardAddress, this.miningReward);
        rewardTx.signTransaction(systemaddress);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(this.chain.length, Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.adjustDifficulty(this.calculateAverageBlockTime(this.chain)));

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
        let block = new Block(this.chain.length, Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log("Block successfully mined ");
        this.chain.push(block);

        this.pendingTransactions = [];
    }

    addData(data) {
        this.pendingTransactions.push(data);
        let block = new Block(this.chain.length, Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log("Block MINED for Data");
        this.chain.push(block);

    }
    sendMoney(privKey, fromAddress, toAddress, amount) {
        const tx = new Transaction(fromAddress, toAddress, amount);
        tx.signTransaction(privKey);
        this.addTransaction(tx);
        console.log("Transaction send successfully ");
        // console.log(tx);
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
        if (address === systemaddress.getPublic('hex')) {
            return this.systemaddress + balance;
        }
        else {
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
module.exports.systemaddress = systemaddress;
