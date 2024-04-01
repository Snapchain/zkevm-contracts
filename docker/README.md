## Prerequisites

- Node.js version: 16.x
- npm version: 7.x

## Setup

```bash
npm i
cp .env.example .env
```

## Build the mock L1 image with deployed CDK contracts

Run

```bash
sudo TAG=<tag> npm run docker:build:mock-l1
```

This will create a new Docker image named `snapchain/geth-cdk-validium-contracts:<tag>`, which includes a Geth node with the deployed contracts. The deployment output can be found at `docker/deploymentOutput/deploy_output.json` and `docker/deploymentOutput/create_rollup_output.json`.

To run the Docker container, use:

```bash
docker run -p 8545:8545 snapchain/geth-cdk-validium-contracts:<tag>
```

## Publish Images
First login with your Docker ID on Docker Hub using access token:

```bash
docker login -u snapchain
```

If you don't have the access token, create one at: https://hub.docker.com/settings/security.

Then you can push the images built from previous step:

```bash
TAG=<tag> npm run docker:push:mock-l1
```

## Test

Replace the <tag> in the `docker/docker-compose-test.yml` and then run

```bash
sudo docker compose -f docker/docker-compose-test.yml up
```

Then run the following command to clean up:

```bash
sudo docker compose -f docker/docker-compose-test.yml down
```
