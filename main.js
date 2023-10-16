const SHA256 = require('crypto-js/sha256');

class Block{
    constructor(index, timestamp , data , prevHash = ''){
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.prevHash = prevHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash(){
        return SHA256(this.index + this.prevHash + this.timestamp + JSON.stringify(this.data + this.nonce)).toString();
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
    }

    createGenesisBlock(){
        return new Block(0 , "16/10/2023 21:13" , "Genesis Block SHA coin" , '0x64');
    }

    getLatestBlock(){
        return this.chain[this.chain.length -1];
    }

    addNewBlock(newBlock){
        newBlock.prevHash = this.getLatestBlock().hash;
        newBlock.mineBlock(4);
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
console.log("mining block 1 ....");
shaCoin.addNewBlock(new Block(1 , "16/10" , {amnt: 40}));

console.log("\nmining block 2 ....");
shaCoin.addNewBlock(new Block(2 , "17/10" , {amnt: 100}));

