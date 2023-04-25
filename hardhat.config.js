require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
require('dotenv').config({
  path: __dirname + '/.env'
});
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
const arguments = require("./scripts/arguments")

const {
  API_URL,
  PRIVATE_KEY,
  ETHERSCAN_API_KEY,
  BSCSCAN_API_KEY
} = process.env;

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {

  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());
});

task("deploy", "Deploy the smart contracts", async (taskArgs, hre) => {
  const [deployer] = await hre.ethers.getSigners();

  const MYToken = await hre.ethers.getContractFactory("DevToken");
  const myToken = await MYToken.deploy(...arguments(deployer.address));

  await myToken.deployed();
  console.log("Deployed contract address:", myToken.address)
  await delay(30000);
  await hre.run("verify:verify", {
    address: myToken.address,
    constructorArguments: arguments(deployer.address),
    contract: "contracts/DevToken.sol:DevToken"
  })
})

module.exports = {
  solidity: "0.8.9",
  defaultNetwork: "goerli",
  networks: {
    hardhat: {},
    goerli: {
      url: API_URL,
      accounts: [PRIVATE_KEY]
    },
    bsctest: {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      accounts: [PRIVATE_KEY]
    },
    bscmain: {
      url: 'https://bsc-dataseed.binance.org/',
      accounts: [PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: BSCSCAN_API_KEY
  }
};
