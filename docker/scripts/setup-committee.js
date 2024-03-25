/* eslint-disable no-await-in-loop */

const { expect } = require('chai');
const ethers = require('ethers');
require('dotenv').config();

const deployOutput = require('../deploymentOutput/create_rollup_output.json');
const dataCommitteeContractJson = require('../../compiled-contracts/PolygonDataCommittee.json');

const DEFAULT_DEPLOYER_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const DEFAULT_DAC_ADDRESS = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';

async function main() {
    const dataCommitteeContractAddress = deployOutput.polygonDataCommitteeAddress;
    if (!dataCommitteeContractAddress) {
        throw new Error(`Missing DataCommitteeContract: ${deployOutput}`);
    }
    const dataCommitteeUrl = process.env.DAC_URL || 'http://127.0.0.1:8444';
    console.log('DAC_URL:', dataCommitteeUrl);
    const dataCommitteeAddress = process.env.DAC_ADDRESS || DEFAULT_DAC_ADDRESS;
    console.log('DAC_ADDRESS:', dataCommitteeAddress);
    // Load provider
    const currentProvider = ethers.getDefaultProvider('http://localhost:8545');
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY || DEFAULT_DEPLOYER_PRIVATE_KEY;
    // Load deployer
    const deployer = new ethers.Wallet(privateKey, currentProvider);

    const requiredAmountOfSignatures = 1;
    const urls = [dataCommitteeUrl];
    const addrsBytes = dataCommitteeAddress;
    const cdkDACContract = new ethers.Contract(dataCommitteeContractAddress, dataCommitteeContractJson.abi, deployer);
    const tx = await cdkDACContract.setupCommittee(
        requiredAmountOfSignatures,
        urls,
        addrsBytes,
    );
    console.log('Transaction hash:', tx.hash);
    // Wait for receipt
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);
    const newDaMember = await cdkDACContract.members(0);
    console.log('new DA member: ', newDaMember);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });