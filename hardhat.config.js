require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
require('dotenv').config({
  path: __dirname + '/.env'
});
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
const { types } = require("hardhat/config")
const arguments = require("./config/arguments")
const { private_key } = require("./config/secret.json")

const {
  API_URL,
  ETHERSCAN_API_KEY,
  BSCSCAN_API_KEY
} = process.env;

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

async function estimateGas(contract, args) {
  const data = contract.interface.encodeDeploy(args)

  return await hre.ethers.provider.estimateGas({ data })
}

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {

  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());
});

task("deploy", "Deploy the smart contracts")
  .addOptionalParam("name", "The token's name", "Mining License Pool")
  .addOptionalParam("symbol", "The token's symbol", "MLP")
  .addOptionalParam("decimals", "The token's decimals", 8, types.int)
  .addOptionalParam("supply", "The token's total supply", 5000, types.int)
  .addOptionalParam("licenseprice", "The initial License price", 0.02, types.float)
  .addOptionalParam("admin", "The admin's address", "0x5F408676D10e85AcE14342e332f3ffE328f8Ae7d")
  .addOptionalParam("adminshare", "The admin's payment share", 25, types.int)
  .addOptionalParam("ownershare", "The owner's payment share", 75, types.int)
  .setAction(async (taskArgs, hre) => {
    const { name, symbol, decimals, supply, licenseprice, admin, adminshare, ownershare } = taskArgs
    const [deployer] = await hre.ethers.getSigners();

    const MYToken = await hre.ethers.getContractFactory("DevToken");
    const gas = await estimateGas(MYToken, arguments(name, symbol, decimals, supply, licenseprice, admin, deployer.address, adminshare, ownershare))

    console.log("Estimated gas to deploy:", Number(gas).toString())

    const myToken = await MYToken.deploy(...arguments(name, symbol, decimals, supply, licenseprice, admin, deployer.address, adminshare, ownershare));

    await myToken.deployed();
    console.log("Deployed contract address:", myToken.address)
    await delay(60000);
    await hre.run("verify:verify", {
      address: myToken.address,
      constructorArguments: arguments(name, symbol, decimals, supply, licenseprice, admin, deployer.address, adminshare, ownershare),
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
      accounts: [private_key]
    },
    bsctest: {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      accounts: [private_key]
    },
    bscmain: {
      url: 'https://bsc-dataseed.binance.org/',
      accounts: [private_key]
    }
  },
  etherscan: {
    apiKey: BSCSCAN_API_KEY
  }
};
