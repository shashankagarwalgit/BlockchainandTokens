const express = require("express");
const sha256 = require('crypto-js/sha256');
const { BlockChain, Transaction } = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const app = express();

const key = ec.genKeyPair();
const accountGen = {
    privKey: key.getPrivate('hex'),
    pubKey: key.getPublic('hex')
};

const randWork = sha256(Date.now().toString());
let shaCoin = new BlockChain();

app.get("/", (req, res) => {
    res.send("Welcome to blockchain of SHA coin");

});


app.get("/mine", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");

    var minelength = 10;

    function mineNextBlock(index) {
        if (index < minelength) {
            shaCoin.addData(randWork);
            shaCoin.minePendingTransactions(accountGen.pubKey);

        } else {
            // Send a final message when mining is completed
            res.json({ message: "Mining completed" });
        }
    }
    shaCoin.chain.forEach((block) => {
        res.json(block);
        setTimeout(() => {
            mineNextBlock(block.index + 1);
        }, 1000);
    });
    // Start mining the first block
    mineNextBlock(0);
});


app.get("/")
app.listen(3000, () => {
    console.log("Server started at 3000");

});
