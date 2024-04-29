const { BlockChain, Transaction, Block, shashankaddress } = require('./blockchain');
const http = require('http');
const https = require('https');

if (process.argv[2] == null && process.argv[3] == null) {
    console.log("Please provide server url and mining reward address \nExiting...");
    process.exit(0);
}

const serverUrl = process.argv[2].toString();
const miningRewardAddress = process.argv[3].toString();

const blockchain = new BlockChain();
// Function to send HTTP/HTTPS POST request
function postData(url, data) {
    return new Promise((resolve, reject) => {
        // Parse the URL
        const parsedUrl = new URL(url);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;

        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
            path: parsedUrl.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = protocol.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                resolve(body);
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

async function sendMinedBlock(blockData) {
    try {
        const response = await postData(`${serverUrl}/mining`, JSON.stringify(blockData));
        console.log(response);
    } catch (error) {
        console.error('Error sending mined block:', error.message);
    }
}

// Function to send HTTP/HTTPS GET request
function getData(url) {
    return new Promise((resolve, reject) => {
        // Parse the URL
        const parsedUrl = new URL(url);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;

        protocol.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve(JSON.parse(data));
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}
async function mineBlock() {
    try {
        const latestBlock = await getData(`${serverUrl}/latestblock`);
        const lengthofblockchain = await getData(`${serverUrl}/blockchain`);
        var difficulty = await getData(`${serverUrl}/difficulty`);
        const reward = await getData(`${serverUrl}/reward`);
        console.log("current length of blockchain: ",lengthofblockchain.length);
        
        const rewardTx = new Transaction('systembymining', miningRewardAddress, parseFloat(reward));
        blockchain.pendingTransactions.push(rewardTx);

        let block = new Block(lengthofblockchain.length, Date.now(), blockchain.pendingTransactions, latestBlock.hash);
        console.log("difficulty:", difficulty);
        block.mineBlock(difficulty);

        console.log("Block successfully mined ");
        sendMinedBlock(block);
        blockchain.pendingTransactions = [];
    } catch (error) {
        console.error('Error mining block:', error.message);
    }
}

console.log("Getting work from server and starting mining...");
// while (process.argv.length >= 3) {
//     mineBlock();
// }
async function startMining() {
    try {
        await mineBlock();
        process.nextTick(startMining);
    } catch (error) {
        console.error('Error mining block:', error.message);
    }
}

startMining();