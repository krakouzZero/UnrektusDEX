require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;
const DOGECHAIN_PRIVATE_KEY = process.env.DOGECHAIN_PRIVATE_KEY || PRIVATE_KEY;
const DOGECHAIN_RPC_URL = process.env.DOGECHAIN_RPC_URL;
const DOGECHAINSCAN_API_KEY = process.env.DOGECHAINSCAN_API_KEY || "abc";

const networks = {
  hardhat: {
    chainId: 31337
  },
  localhost: {
    url: "http://127.0.0.1:8545"
  }
};

if (PRIVATE_KEY && RPC_URL) {
  networks.sepolia = {
    url: RPC_URL,
    accounts: [PRIVATE_KEY]
  };
}

if (DOGECHAIN_PRIVATE_KEY && DOGECHAIN_RPC_URL) {
  networks.dogechain = {
    url: DOGECHAIN_RPC_URL,
    chainId: 2000,
    accounts: [DOGECHAIN_PRIVATE_KEY]
  };
}

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.6.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  networks,
  etherscan: {
    apiKey: {
      dogechain: DOGECHAINSCAN_API_KEY
    },
    customChains: [
      {
        network: "dogechain",
        chainId: 2000,
        urls: {
          apiURL: "https://explorer.dogechain.dog/api",
          browserURL: "https://explorer.dogechain.dog"
        }
      }
    ]
  }
};
