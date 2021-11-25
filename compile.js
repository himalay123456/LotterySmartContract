const path = require('path');
const fs = require('fs');
const solc = require('solc');

const CONTRACT_PATH = path.resolve(__dirname, 'contracts', 'Lottery.sol');
const source = fs.readFileSync(CONTRACT_PATH, 'utf8');

const Contract = solc.compile(source, 1).contracts[':Lottery'];
// console.log(Contract);
module.exports = Contract;


