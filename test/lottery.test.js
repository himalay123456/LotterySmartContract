const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3')
const { interface, bytecode } = require('../compile');

const web3 = new Web3(ganache.provider());
let accounts;
let lottery;
beforeEach(async() => {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000' })
})

describe('lottery', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
    });

    it('Manager is stored', async () => {
        const manager = await lottery.methods.manager().call();
        assert.equal(manager, accounts[0]);
    });

    it('Single user enter check', async() => {
        await lottery.methods.enter().send({ from: accounts[1], value: web3.utils.toWei('0.02', 'ether') });
        const players = await lottery.methods.getAllPlayers().call();
        assert.equal(players[0], accounts[1])
    })

    it('Multiple user enter check', async() => {
        await lottery.methods.enter().send({ from: accounts[2], value: web3.utils.toWei('0.02', 'ether') });
        await lottery.methods.enter().send({ from: accounts[3], value: web3.utils.toWei('0.02', 'ether') });
        await lottery.methods.enter().send({ from: accounts[4], value: web3.utils.toWei('0.02', 'ether') });
        const players = await lottery.methods.getAllPlayers().call();
        assert.equal(players[0], accounts[2])
        assert.equal(players[1], accounts[3])
        assert.equal(players[2], accounts[4])
    })

    it('Minimum ether accepted', async() => {
        try{
            await lottery.methods.enter().send({ from: accounts[3], value: web3.utils.toWei('0', 'ether') });
            assert(false);
        }catch(err){
            assert(err);
        }
    })

    it('Balance check', async() => {
        await lottery.methods.enter().send({ from: accounts[3], value: web3.utils.toWei('0.02', 'ether') });
        const amount = await lottery.methods.getPoolBalance().call();
        assert.equal(amount, web3.utils.toWei('0.02', 'ether'));
    })

    it('Restricted Get winner', async() => {
        try{
            await lottery.methods.pickWinner().call({ from: accounts[3] })
            assert(false);
        }catch(err){
            assert(err);
        }
    })

    it('Check the whole lottery flow', async() => {
        await lottery.methods.enter().send({ from:accounts[0], value:web3.utils.toWei('1', 'ether')});

        const playersPool = await lottery.methods.getAllPlayers().call();
        assert.equal(1, playersPool.length);

        const initialBal = await web3.eth.getBalance(accounts[0]);
        const winner = await lottery.methods.pickWinner().send({ from: accounts[0] });
        console.log(accounts[0])
        console.log('Winner is', winner);

        const finalBal = await web3.eth.getBalance(accounts[0]);
        const address = await lottery.methods.getWinner().call();
        console.log('Winner is ', address);
        const diff = finalBal - initialBal;
        console.log('difference', diff);
        assert(diff > web3.utils.toWei('0.8', 'ether'));

        const players = await lottery.methods.getAllPlayers().call();
        assert.equal(0, players.length);

    })

})