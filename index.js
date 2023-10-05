const crypto = require("crypto");
// Transfer of funds between two wallets
class Transaction {
    constructor(amount, payer, // public key
    payee // public key
    ) {
        this.amount = amount;
        this.payer = payer;
        this.payee = payee;
    }
    toString() {
        return JSON.stringify(this);
    }
}
// Individual block on the chain
class Block {
    constructor(prevHash, transaction, ts = Date.now()) {
        this.prevHash = prevHash;
        this.transaction = transaction;
        this.ts = ts;
        this.nonce = Math.round(Math.random() * 9999999999);
        this.currentHash = this.calculateHash(); // Calculate and store the current block's hash
    }

    calculateHash() {
        const str = JSON.stringify(this);
        const hash = crypto.createHash('SHA256');
        hash.update(str).end();
        return hash.digest('hex');
    }

    get hash() {
        return this.currentHash;
    }
};

// The blockchain
class Chain {
    constructor() {
        this.chain = [
            // Genesis block
            new Block('', new Transaction(10000, 'genesis', 'Shashank'))
        ];
    }
    // Most recent block
    get lastBlock() {
        return this.chain[this.chain.length - 1];
    }
    // Proof of work system
    mine(nonce) {
        let solution = 1;
        console.log('⛏️  mining...');
        while (true) {
            const hash = crypto.createHash('SHA256');
            hash.update((nonce + solution).toString()).end();
            const attempt = hash.digest('hex');
            if (attempt.substring(0, 4) === '0000') {
                console.log(`Solved: ${solution}`);
                return solution;
            }
            solution += 1;
        }
    }
    // Add a new block to the chain if valid signature & proof of work is complete
    addBlock(transaction, senderPublicKey, signature) {
        const verify = crypto.createVerify('SHA256');
        verify.update(transaction.toString());
        const isValid = verify.verify(senderPublicKey, signature);
        if (isValid) {
            const newBlock = new Block(this.lastBlock.hash, transaction);
            this.mine(newBlock.nonce);
            this.chain.push(newBlock);
        }
    }
}
// Singleton instance
Chain.instance = new Chain();
// Wallet gives a user a public/private keypair
class Wallet {
    constructor() {
        const keypair = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });
        this.privateKey = keypair.privateKey;
        this.publicKey = keypair.publicKey;
    }
    sendMoney(amount, payeePublicKey) {
        const transaction = new Transaction(amount, this.publicKey, payeePublicKey);
        const sign = crypto.createSign('SHA256');
        sign.update(transaction.toString()).end();
        const signature = sign.sign(this.privateKey);
        Chain.instance.addBlock(transaction, this.publicKey, signature);
    }
};

// Example usage
const satoshi = new Wallet();
const bob = new Wallet();
satoshi.sendMoney(50, bob.publicKey);
console.log(Chain.instance.chain);

