const express = require("express");
const sha256 = require('crypto-js/sha256');
const { BlockChain, Transaction ,shashankaddress} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const fs = require('fs');
const app = express();

let shaCoin = new BlockChain();

if(fs.existsSync('blockchain.json')) {
    shaCoin.chain = JSON.parse(fs.readFileSync('blockchain.json'));
}

app.use(express.json());
app.get("/", (req, res) => {
    res.json("Welcome to blockchain of SHA coin");
});

app.post("/mining", async (req, res) => {
    var minedBlockData = req.body; // Assuming the client sends the mined block data in the request body

        shaCoin.chain.push(minedBlockData);
        res.json({ message: "Block added successfully" });
        console.log(`Block from client added successfully ${JSON.stringify(minedBlockData,null,4)}`);
        fs.writeFileSync('blockchain.json', JSON.stringify(shaCoin.chain, null, 4));
});

app.get("/difficulty", async (req,res)=> {
    res.json(shaCoin.adjustDifficulty(shaCoin.calculateAverageBlockTime(shaCoin.chain)));
});

app.get("/reward", async (req,res)=> {
    res.json(await shaCoin.miningReward);
});

app.get("/balance/:address", async (req,res)=>{
    shaCoin.chain = JSON.parse(fs.readFileSync('blockchain.json'));
    console.log(shaCoin.getBalanceOfAddress(req.params.address));
    
    res.json(await shaCoin.getBalanceOfAddress(req.params.address));
});

app.post("/sendMoney", async (req,res)=>{
    var formData = req.body;
    const key = ec.keyFromPrivate(await formData.privateKey.toString());
    const myWalletAddress = key.getPublic('hex');
    if(shaCoin.getBalanceOfAddress(myWalletAddress) < parseFloat(formData.amount)){
        res.json({message: "Insufficient balance"});
        return;
    }
    const tx = new Transaction(myWalletAddress, await formData.toAddress.toString(), await parseFloat(formData.amount));
    tx.signTransaction(key);
    shaCoin.addTransaction(tx);
    res.json({ message: "Transaction added successfully", transaction: tx });
    fs.writeFileSync('blockchain.json', JSON.stringify(shaCoin.chain, null, 4));
});

app.get("/acc", async (req, res) => {
    const key = ec.genKeyPair();
    const accountGen = {
        privKey: key.getPrivate('hex'),
        pubKey: key.getPublic('hex')
    };
    res.json(await accountGen);
});

app.get("/blockchain", async (req,res)=>{
    res.json(await shaCoin.chain);
});

app.get("/tx/:txhash", async (req,res)=>{
    for(let block of shaCoin.chain){
        if(block.hash == req.params.txhash){
            res.json(await block);
            return;
        }
    }
    res.json({message: "Block not found"});
});

app.get("/block/:no", async (req,res)=>{
    if(req.params.no >= shaCoin.chain.length){
        res.json({message: "Block not found"});
    }
    res.json(await shaCoin.chain[req.params.no]);
});

app.get("/latestblock", async (req,res)=>{
    res.json(shaCoin.getLatestBlock());
});

app.listen(3000, () => {
    console.log("Server started at 3000");

});
