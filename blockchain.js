const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction{
    constructor(fromAddress , toAddress , amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error("you cannot sign transactions to other wallet");
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx , 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid(){
        if(this.fromAddress === null){return true}

        if(!this.signature || this.signature.length === 0){
            throw new Error("no signature in this transaction");
        }
        const publicKey = ec.keyFromPublic(this.fromAddress , 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block{
    constructor(timestamp , transactions , prevHash = ''){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.prevHash = prevHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash(){
        return SHA256(this.index + this.prevHash + this.timestamp + JSON.stringify(this.transactions + this.nonce)).toString();
    }

    mineBlock(difficulty){
        while(this.hash.substring(0,difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();   
        }

        console.log("Block mined:  " + this.hash);
        console.log("Solution find at: " + this.nonce);
    }
    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }
        return true;
    }
}

class BlockChain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.pendingTransactions = [];
        this.miningReward = 25;
    }

    createGenesisBlock(){
        return new Block("16/10/2023 21:13" , "Genesis Block SHA coin" , '0x64');
    }

    getLatestBlock(){
        return this.chain[this.chain.length -1];
    }

     minePendingTransactions(miningRewardAddress){
        const rewardTx = new Transaction(null, miningRewardAddress , this.miningReward);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now() , this.pendingTransactions , this.getLatestBlock().hash);
        block.mineBlock(6);

        console.log("Block successfully mined ");
        this.chain.push(block);

        this.pendingTransactions = [];
        
    }

    addTransaction(transaction){
        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('Transaction mujst include from and to address');
        }
        if(!transaction.isValid()){
            throw new Error('Cannot add invalid transaction to chain');
        }
        this.pendingTransactions.push(transaction);
    } 
    
    getBalanceOfAddress(address){
        var balance = 0;
        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }

                if(trans.toAddress === address){
                    balance += trans.amount;
                }
            }
        }
        return balance;
    }

    isChainValid(){
        for(let i= 1; i<this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

            if(!currentBlock.hasValidTransactions()){
                return false;
            }

            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            if(currentBlock.prevHash !== previousBlock.hash){
                return false;
            }
        }

        return true;
    }
}

module.exports.BlockChain = BlockChain;
module.exports.Transaction = Transaction;