let utils = require("../test/utils/utils.js");
utils.setWeb3(web3);

let MultiSigWallet = artifacts.require("MultiSigWallet");
let DecentBetToken = artifacts.require("DecentBetToken");
let UpgradeAgent = artifacts.require("UpgradeAgent");
let DecentBetVault = artifacts.require("DecentBetVault");
let House = artifacts.require("House");
let SportsBetting = artifacts.require("SportsBetting");
let Slots = artifacts.require("Slots");

let ECVerify = artifacts.require("ECVerify")
let GameChannelManager = artifacts.require("GameChannelManager");
let SlotsChannel = artifacts.require("SlotsChannel");
let SlotsHelper = artifacts.require("SlotsHelper")

module.exports = function (deployer, network) {
    let decentBetMultisig;
    let upgradeMaster, agentOwner;
    let startBlock, endBlock;
    let accounts = web3.eth.accounts.slice(0, 3);
    let signaturesRequired = 2;
    let token, wallet, upgradeAgent, newToken, house, randomExample, gameChannelManager, ecVerify,
        sportsBetting, slots, slotsHelper;
    console.log('Network: ' + network + ', startBlock: ' + web3.eth.blockNumber);
    if (network == 'testnet' || network == 'development') {
        deployer.deploy(MultiSigWallet, accounts, signaturesRequired).then(function (instance) {
            wallet = instance;
            upgradeMaster = web3.eth.accounts[0];
            agentOwner = upgradeMaster;
            decentBetMultisig = MultiSigWallet.address;
            startBlock = web3.eth.blockNumber + 2;
            endBlock = web3.eth.blockNumber + 20000;
            return deployer.deploy(DecentBetToken, decentBetMultisig, upgradeMaster, startBlock, endBlock);
        }).then(function (instance) {
            return DecentBetToken.deployed();
        }).then(function (instance) {
            token = instance;
            //     let functionData = utils.getFunctionEncoding('UpgradeAgent(address)', [token.address]);
            //     console.log('functionData: ' + functionData);
            //     return web3.eth.estimateGas({data: functionData});
            // }).then(function (gasEstimate) {
            //     console.log('estimated gas for UpgradeAgent: ' + gasEstimate);
            //     let gasEstimate = 3000000;
            //     return deployer.deploy(UpgradeAgent, token.address, {
            //         from: agentOwner,
            //         gas: gasEstimate + utils.gasEpsilon
            //     });
            // }).then(function () {
            //     return UpgradeAgent.deployed();
            // }).then(function (instance) {
            //     upgradeAgent = instance;
            return deployer.deploy(House, token.address);
        }).then(function (instance) {
            return House.deployed();
        }).then(function (instance) {
            house = instance;
            console.log('Deploying SportsBetting with addresses: ' + token.address + ', ' + house.address);
            return deployer.deploy(SportsBetting, token.address, house.address);
        }).then(function () {
            return SportsBetting.deployed();
        }).then(function (instance) {
            sportsBetting = instance;
            return deployer.deploy(Slots, token.address, house.address);
        }).then(function () {
            return Slots.deployed();
        }).then(function (instance) {
            slots = instance;
            //     let fees = 0.002 * ethUnits.units.ether;
            //     return deployer.deploy(RandomExample, {
            //         from: agentOwner
            //     });
            // }).then(function () {
            console.log('House: ' + web3.eth.accounts[0])
            return deployer.deploy(ECVerify)
        }).then(function (instance) {
            ecVerify = instance
            return deployer.link(ECVerify, GameChannelManager)
        }).then(function () {
            console.log('Linked ecverify to GameChannelManager')
            return deployer.deploy(SlotsHelper)
        }).then(function(){
            return SlotsHelper.deployed();
        }).then(function(instance) {
            console.log('Deployed Slots Helper')
            slotsHelper = instance

            console.log('Deploying GameChannelManager with token: ' + token.address + ', slotsHelper: ' +
                slotsHelper.address + ' and ' + web3.eth.accounts[0])
            return deployer.deploy(GameChannelManager, token.address, slotsHelper.address, web3.eth.accounts[0]);
        }).then(function (instance) {
            gameChannelManager = instance;
        });
        /** Won't work until in Success state */
        // .then(function (instance) {
        //     upgradeAgent = instance;
        //     return token.setUpgradeAgent(upgradeAgent.address);
        // }).then(function () {
        //     console.log('Successfully setUpgradeAgent')
        // }).catch(function (err) {
        //     console.log('Error: ' + err)
        // }).then(function () {
        //     return deployer.deploy(NewToken, upgradeAgent.address);
        // }).then(function () {
        //     console.log('deployed NEWTOKEN');
        //     return NewToken.deployed();
        // }).then(function (instance) {
        //     newToken = instance;
        //     return upgradeAgent.setNewToken(newToken.address);
        // });
    } else if (network == 'mainnet') {
        // check this
        MultiSigWallet.at(utils.multisigWalletAddressMainNet).then(function (instance) {
            wallet = instance;
            upgradeMaster = web3.eth.accounts[0];
            agentOwner = upgradeMaster;
            decentBetMultisig = MultiSigWallet.address;
            startBlock = startBlockMainNet;
            endBlock = endBlockMainNet;
            return deployer.deploy(DecentBetToken, decentBetMultisig, upgradeMaster, startBlock, endBlock);
        }).then(function (instance) {
            return DecentBetToken.deployed();
        }).then(function (instance) {
            token = instance;
            //   functionData = utils.getFunctionEncoding('UpgradeAgent(address)',[token.address]);
            //   return web3.eth.estimateGas({data:functionData});
            // }).then(function(gasEstimate){
            //   console.log(gasEstimate);
            gasEstimate = 2000000;
            return deployer.deploy(UpgradeAgent, token.address, {
                from: agentOwner,
                gas: gasEstimate + utils.gasEpsilon
            });
        }).then(function () {
            return UpgradeAgent.deployed();
        }).then(function (instance) {
            upgradeAgent = instance;
            return token.setUpgradeAgent(upgradeAgent.address);
        })
    }
};