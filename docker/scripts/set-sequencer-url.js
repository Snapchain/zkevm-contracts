/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */

/*
* TODO:
* 1. make these a input param
* 2. convert this script to a hardhat task
* 3. create a npm command that will preconfig these params
*/
const createRollupOutput = require('../deploymentOutput/create_rollup_output.json');
const zkEVMContractJson = require('../../compiled-contracts/PolygonZkEVM.json');

const DEFAULT_DEPLOYER_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

async function main() {
    const zkEVMContractAddress = createRollupOutput.rollupAddress;
    if (!zkEVMContractAddress) {
        throw new Error(`Missing rollupAddress: ${createRollupOutput}`);
    }
    const sequencerUrl = process.env.SEQUENCER_URL || 'http://zkevm-json-rpc:8123';
    console.log('SEQUENCER_URL:', sequencerUrl);

    // Get the network argument from the command line
    const network = process.argv[2];
    let networkURL;
    // Determine the chainId based on the network
    switch (network) {
        case 'localhost':
            networkURL = 'http://localhost:8545';
            break;
        case 'sepolia':
            networkURL = `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`;
            break;
        // Add more cases for different networks here
        default:
            console.error('chain not supported');
            return; // Exit the function if the chain is not supported
    }
    // Load provider
    const currentProvider = ethers.getDefaultProvider(networkURL);
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY || DEFAULT_DEPLOYER_PRIVATE_KEY;
    // Load deployer
    const deployer = new ethers.Wallet(privateKey, currentProvider);

    const zkEVMContract = new ethers.Contract(zkEVMContractAddress, zkEVMContractJson.abi, deployer);
    const currentUrl = await zkEVMContract.trustedSequencerURL();
    console.log(`current trustedSequencerUrl: ${currentUrl}\n`);

    const tx = await zkEVMContract.setTrustedSequencerURL(sequencerUrl);
    console.log('Transaction hash:', tx.hash);
    // Wait for receipt
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);
    const newUrl = await zkEVMContract.trustedSequencerURL();
    console.log(`new trustedSequencerUrl: ${newUrl}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
