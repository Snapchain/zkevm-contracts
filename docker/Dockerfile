FROM node:18-bullseye

# Set the working directory
WORKDIR /zkevm-contracts

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install zkevm-contracts dependencies
RUN npm install

# Copy the entire zkevm-contracts
COPY . .

ENTRYPOINT ["/bin/bash"]