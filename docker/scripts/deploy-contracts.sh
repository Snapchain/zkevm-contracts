#!/bin/bash
echo "JSONRPC_HTTP_URL: $JSONRPC_HTTP_URL"
node docker/scripts/fund-accounts.js
echo "Replace 1001 with $L2_CHAIN_ID"
sed -i.bak "s/\"chainID\": 1001/\"chainID\": $L2_CHAIN_ID/g" docker/scripts/deploy_parameters_docker.json
cp docker/scripts/deploy_parameters_docker.json deployment/deploy_parameters.json
cp docker/scripts/genesis_docker.json deployment/genesis.json
npx hardhat run deployment/testnet/prepareTestnet.js --network zkevmMockL1Network
npx hardhat run deployment/2_deployPolygonZKEVMDeployer.js --network zkevmMockL1Network
npx hardhat run deployment/3_deployContracts.js --network zkevmMockL1Network
mkdir docker/deploymentOutput
mv deployment/deploy_output.json docker/deploymentOutput