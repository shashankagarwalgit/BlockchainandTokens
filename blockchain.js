const SHA256 = require('crypto-js/sha256');

class Transaction{
    constructor(fromAddress , toAddress , amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
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
        let block = new Block(Date.now() , this.pendingTransactions);
        block.mineBlock(2);

        console.log("Block successfully mined ");
        this.chain.push(block);

        this.pendingTransactions = [
            new Transaction(null , miningRewardAddress , this.miningReward)
        ];
        
    }

    createTransaction(transaction){
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