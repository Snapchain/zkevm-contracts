#!/bin/bash
set -eu

# compile contracts
# npx hardhat clean
npx hardhat compile

rm -f .openzeppelin/unknown-*.json
rm -rf docker/gethData/geth_data
rm -f deployment/deploy_ongoing.json
rm -rf docker/deploymentOutput/
mkdir -p docker/deploymentOutput/

# Start local geth
# export DEV_PERIOD=13
DOCKER_COMPOSE="docker-compose -f docker/docker-compose.yml"
$DOCKER_COMPOSE up -d geth
# Check if containers are up and running before proceeding
while [[ $($DOCKER_COMPOSE ps -q | wc -l) -ne $($DOCKER_COMPOSE ps -q --filter "status=running" | wc -l) ]]; do
    echo "Waiting for containers to start..."
    sleep 2
done
sleep 3
echo "containers started!"

# Fund L1 accounts
# node docker/scripts/fund-accounts.js

# Copy deployment and rollup creation params
cp docker/scripts/v2/deploy_parameters_docker.json deployment/v2/deploy_parameters.json
cp docker/scripts/v2/create_rollup_parameters_docker.json deployment/v2/create_rollup_parameters.json

# 1) Deploy Pol Token contract and write into deploy_parameters.json
# 2) fund sequencer eth and POL
# 3) fund aggregator eth
npm run prepare:testnet:ZkEVM:localhost

# Copy genesis json. Same as `npx ts-node deployment/v2/1_createGenesis.ts`
cp docker/scripts/v2/genesis_docker.json deployment/v2/genesis.json

# Deploy the deployer contract
npx hardhat run deployment/v2/2_deployPolygonZKEVMDeployer.ts --network localhost

# Deploy the zkEVM contracts and create rollup
npx hardhat run deployment/v2/3_deployContracts.ts --network localhost
npx hardhat run deployment/v2/4_createRollup.ts --network localhost

mv deployment/v2/deploy_output.json docker/deploymentOutput
mv deployment/v2/genesis.json docker/deploymentOutput
mv deployment/v2/create_rollup_output.json docker/deploymentOutput

# Update the contracts with information about DAC
npm run setComittee:localhost

docker-compose -f docker/docker-compose.yml down
docker build --platform=linux/amd64 -t snapchain/geth-cdk-validium-contracts:${TAG} -f docker/Dockerfile .

# Let it readable for the multiplatform build coming later!
chmod -R go+rxw docker/gethData