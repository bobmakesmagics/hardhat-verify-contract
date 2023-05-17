const ethers = require('ethers')
module.exports = (name, symbol, decimals, supply, licenseprice, admin, deployer_address, adminshare, ownershare) => [
    name,                                              // [PROJECT_NAME]
    symbol,                                                              // [PROJECT_SYMBOL]
    decimals,                                                                  // [PROJECT_DECIMALS]
    supply,                                                               // [PROJECT_SUPPLY]
    ethers.utils.parseEther(licenseprice.toString()),                                    // [INITIAL_LICENSE_PRICE]
    [admin, deployer_address],   // [ADMIN_ADDRESS]
    [adminshare, ownershare]                                                            // [SHARES OF ADMIN AND OWNER]                  
]