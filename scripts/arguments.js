const ethers = require('ethers')
module.exports = (deployer_address) => [
    "Mining License Pool",    // [PROJECT_NAME]
    "MLP",                    // [PROJECT_SYMBOL]
    8,                        // [PROJECT_DECIMALS]
    5000,                     // [PROJECT_SUPPLY]
    ethers.utils.parseEther('0.02'),  // [INITIAL_LICENSE_PRICE]
    ["0x5F408676D10e85AcE14342e332f3ffE328f8Ae7d", deployer_address], // [ADMIN_ADDRESS]
    [25, 75]                                                          // [SHARES OF AMIND AND OWNER]                  
]