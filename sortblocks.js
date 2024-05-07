function sortBlocks(blockchain) {
  return blockchain.sort((a, b) => a.timestamp - b.timestamp);
}
module.exports = sortBlocks;