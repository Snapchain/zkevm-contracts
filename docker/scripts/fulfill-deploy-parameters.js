/* eslint-disable no-await-in-loop */
const { ethers } = require('hardhat');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pathDeployParameters = path.join(__dirname, './deploy_parameters_docker.json');
const deployParameters = require('./deploy_parameters_docker.json');

const DEFAULT_L2_CHAIN_ID = 1001;
const DEFAULT_DEPLOYER_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

async function main() {
    const chainID = Number(process.env.L2_CHAIN_ID) || DEFAULT_L2_CHAIN_ID;
    console.log('ChainID:', chainID);
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY || DEFAULT_DEPLOYER_PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey);
    const address = await wallet.getAddress();
    console.log('Deployer address:', address);

    deployParameters.chainID = chainID;
    deployParameters.deployerPvtKey = privateKey;
    deployParameters.trustedSequencer = address;
    deployParameters.admin = address;
    deployParameters.zkEVMOwner = address;
    deployParameters.timelockAddress = address;
    deployParameters.zkEVMDeployerAddress = address;
    deployParameters.initialZkEVMDeployerOwner = address;
    
    fs.writeFileSync(pathDeployParameters, JSON.stringify(deployParameters, null, 1));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
