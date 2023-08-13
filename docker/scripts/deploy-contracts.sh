#!/bin/bash
set -eu

echo "JSONRPC_HTTP_URL: $JSONRPC_HTTP_URL"
node docker/scripts/fund-accounts.js
node docker/scripts/fulfill-deploy-parameters.js
cp docker/scripts/deploy_parameters_docker.json deployment/deploy_parameters.json
cp docker/scripts/genesis_docker.json deployment/genesis.json
npx hardhat run deployment/testnet/prepareTestnet.js --network zkevmMockL1Network
npx hardhat run deployment/2_deployPolygonZKEVMDeployer.js --network zkevmMockL1Network
npx hardhat run deployment/3_deployContracts.js --network zkevmMockL1Network
mkdir docker/deploymentOutput
mv deployment/deploy_output.json docker/deploymentOutput