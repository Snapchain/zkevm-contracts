/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */

require('dotenv').config();

const deployOutput = require('../../docker/deploymentOutput/deploy_output.json');
const createRollupOutput = require('../deploymentOutput/create_rollup_output.json');
const polTokenContractJson = require('../../compiled-contracts/ERC20PermitMock.json');

const DEFAULT_DEPLOYER_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

async function main() {
    const polTokenContractAddress = deployOutput.polTokenAddress;
    if (!polTokenContractAddress) {
        throw new Error(`Missing polTokenAddress: ${deployOutput}`);
    }
    const zkEVMContractAddress = createRollupOutput.rollupAddress;
    if (!zkEVMContractAddress) {
        throw new Error(`Missing rollupAddress: ${createRollupOutput}`);
    }
    // Load provider
    const currentProvider = ethers.getDefaultProvider(`https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`);
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY || DEFAULT_DEPLOYER_PRIVATE_KEY;
    // Load deployer
    const deployer = new ethers.Wallet(privateKey, currentProvider);

    const polTokenContract = new ethers.Contract(polTokenContractAddress, polTokenContractJson.abi, deployer);
    const tx = await polTokenContract.approve(
        zkEVMContractAddress,
        ethers.utils.parseEther('10000000000.0'),
    );
    console.log('Transaction hash:', tx.hash);
    // Wait for receipt
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);
}

// to prevent execution by accident on import
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}
