# Sample Demo Project

Try running some of the following tasks to deploy and verify the smart contract:

-in the root folder

fist of all, rename the `env.example` to `.env` and set the <API_KEY>, <API_URL> from alchemy and the <PRIVATE_KEY> from metamask and the <ETHERSCAN_API> from https://etherscan.io/

```
> npm install
> npx hardhat compile
(before compiling, the private_key should be replaced with the proper deployer's address on /config/secret.json)
> npx hardhat deploy --network bsctest --name 'Mining License Pool' --symbol 'MLP' --decimals 8 --supply 5000 --licenseprice 0.03 --admin 0x5F408676D10e85AcE14342e332f3ffE328f8Ae7d --adminshare 25 --ownershare 75
```
