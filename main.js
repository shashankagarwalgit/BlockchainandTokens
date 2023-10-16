const SHA256 = require('crypto-js/sha256');

class Block{
    constructor(index, timestamp , data , prevHash = ''){
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.prevHash = prevHash;
        this.hash = this.calculateHash();
    }

    calculateHash(){
        return SHA256(this.index + this.prevHash + this.timestamp + JSON.stringify(this.data)).toString();
    }

}

class BlockChain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock(){
        return new Block(0 , "16/10/2023 21:13" , "Genesis Block SHA coin" , '0x64');
    }

    getLatestBlock(){
        return this.chain[this.chain.length -1];
    }

    addNewBlock(newBlock){
        newBlock.prevHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
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

let shaCoin = new BlockChain();
shaCoin.addNewBlock(new Block(1 , "16/10" , {amnt: 40}));
shaCoin.addNewBlock(new Block(2 , "17/10" , {amnt: 100}));
