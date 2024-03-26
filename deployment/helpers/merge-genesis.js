/* eslint-disable no-console */
/*
 * Create the genesis json file to be used in the node configs
 * Usage: npm run deploy:merge:genesis <network>
 */

const fs = require('fs');
const path = require("path");

// Assuming the second JSON is stored as config.json and genesis.json respectively
const genesisData = require('../../docker/deploymentOutput/genesis.json');
const configData = require('../../docker/deploymentOutput/deploy_output.json');
const configRollupData = require('../../docker/deploymentOutput/create_rollup_output.json');
const outputFilePath = path.join(__dirname, "../../docker/deploymentOutput/genesis.config.json");

function main() {
    // Get the network argument from the command line
    const network = process.argv[2];
    let chainId;

    // Determine the chainId based on the network
    switch (network) {
        case 'localhost':
            chainId = 1337;
            break;
        case 'sepolia':
            chainId = 11155111;
            break;
        // Add more cases for different networks here
        default:
            console.error('chain not supported');
            return; // Exit the function if the chain is not supported
    }

    // Construct the new JSON structure
    // Reference: https://github.com/0xPolygon/cdk-validium-node/blob/v0.6.2%2Bcdk-hotfix1/docs/config-file/custom_network-config-doc.md
    const newData = {
        l1Config: {
            chainId,
            polygonZkEVMAddress: configRollupData.rollupAddress,
            polygonRollupManagerAddress: configData.polygonRollupManagerAddress,
            polTokenAddress: configData.polTokenAddress,
            polygonZkEVMGlobalExitRootAddress: configData.polygonZkEVMGlobalExitRootAddress,
        },
        rollupCreationBlockNumber: configRollupData.createRollupBlockNumber,
        rollupManagerCreationBlockNumber: configData.deploymentRollupManagerBlockNumber,
        root: genesisData.root,
        genesis: genesisData.genesis,
        // TODO: check it
        firstBatchData: configRollupData.firstBatchData,
    };

    // Write the new JSON to a file
    fs.writeFileSync(outputFilePath, JSON.stringify(newData, null, 2));

    console.log(
        `New JSON file has been created at ${outputFilePath} for the ${network} network.`,
    );
}

if (require.main === module) {
    main();
}