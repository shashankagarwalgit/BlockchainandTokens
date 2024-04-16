const express = require("express");
const sha256 = require('crypto-js/sha256');
const { BlockChain, Transaction } = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const app = express();

const randWork = sha256(Date.now().toString());
let shaCoin = new BlockChain();

function mineNextBlock(value,pubaddr) {
    while(value>=1) {
        shaCoin.addData(randWork);
        shaCoin.minePendingTransactions(pubaddr);
        value--;
    }
}

// Start mining the first block
mineNextBlock(0);
app.get("/", (req, res) => {
    res.send("Welcome to blockchain of SHA coin");
});


app.get("/mine/:no/:addr", async (req, res) => {
    mineNextBlock(req.params.no,req.params.addr);
    res.json(await shaCoin.getLatestBlock());
});

app.get("/balance/:address", async (req,res)=>{
    res.send(await shaCoin.getBalanceOfAddress(req.params.address));
})

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

app.get("/block/:no", async (req,res)=>{
    res.json(await shaCoin.chain[req.params.no - 1]);
});

app.listen(3000, () => {
    console.log("Server started at 3000");

});
