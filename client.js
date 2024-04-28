const { BlockChain, Transaction, Block } = require('./blockchain');
const http = require('http');

if (process.argv[2] == null && process.argv[3] == null) {
    console.log("Please provide server url and mining reward address \nExiting...");
    process.exit(0);
}

const serverUrl = process.argv[2];
const miningRewardAddress = process.argv[3].toString();
const blockchain = new BlockChain();

// Function to send HTTP POST request
function postData(url, data) {
    return new Promise((resolve, reject) => {
        // Parse the URL
        const parsedUrl = new URL(url);

        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 80,
            path: parsedUrl.pathname, // Use the pathname from the parsed URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
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

// Function to send mined block data to the server
async function sendMinedBlock(blockData) {
    try {
        const response = await postData(`${serverUrl}/mining`, JSON.stringify(blockData));
        console.log(response);
    } catch (error) {
        console.error('Error sending mined block:', error.message);
    }
}

// Function to send HTTP GET request
function getData(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
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

// Function to mine a block
async function mineBlock() {
    try {
        const latestBlock = await getData(`${serverUrl}/latestblock`);
        const lengthofblockchain = await getData(`${serverUrl}/blockchain`);
        var difficulty = await getData(`${serverUrl}/difficulty`);
        console.log("current length of blockchain: ",lengthofblockchain.length);
        
        const rewardTx = new Transaction('systembymining', miningRewardAddress, blockchain.miningReward);
        blockchain.pendingTransactions.push(rewardTx);

        const block = new Block(lengthofblockchain.length, Date.now(), blockchain.pendingTransactions, latestBlock.hash);
        console.log("difficulty:", difficulty);
        block.mineBlock(difficulty);

        console.log("Block successfully mined ");
        sendMinedBlock(block);
    } catch (error) {
        console.error('Error mining block:', error.message);
    }
}

console.log("Getting work from server and starting mining...");
setInterval(mineBlock, 3000);
