const { BlockChain, Transaction, Block, shashankaddress } = require('./blockchain');
const { ec: EC } = require('elliptic');
const { default: axios } = require('axios');
const ec = new EC('secp256k1');


const serverUrl = 'http://192.168.1.7:3000'; // Replace with your server's URL
const miningRewardAddress = '04d5574514deadba239eee74b3bf7b71b633decf8e38ef06e6408c3f4d49a59bcb6bce3951bd31f622a1b2f0e794130d19865f5d07b5a405e42bc8dc8c1c2f4552'; // Replace with your mining reward address

// Create a new blockchain instance
const blockchain = new BlockChain();

// Function to send mined block data to the server
async function sendMinedBlock(blockData) {
    try {
        const response = await axios.post(`${serverUrl}/mining`, blockData);
        console.log(response.data);
    } catch (error) {
        console.error('Error sending mined block:', error.message);
    }
}

// Function to mine a block
async function mineBlock() {
    let latestBlock = await axios.get(`${serverUrl}/latestblock`);
    const rewardTx = new Transaction('systembymining', miningRewardAddress, blockchain.miningReward);
    blockchain.pendingTransactions.push(rewardTx);

    let block = new Block(Date.now(), blockchain.pendingTransactions, latestBlock.data.hash);
    block.mineBlock(6);

    console.log("Block successfully mined ");
    sendMinedBlock(block);
}

// Start mining
mineBlock();
