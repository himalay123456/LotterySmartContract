const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

const provider = new HDWalletProvider(
    'delay setup junior budget cushion program melt summer dash drip wet grant',
    'https://rinkeby.infura.io/v3/08c7635adbcd4dfaaccdf850a5d8b782',
);

const web3 = new Web3(provider);

const deploy = async() => {
    const accounts = await web3.eth.getAccounts();
    const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000' })

    console.log(interface);
    console.log('Contract Deployed At', result.options.address);
}

deploy();



