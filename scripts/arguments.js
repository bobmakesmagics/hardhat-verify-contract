const ethers = require('ethers')
module.exports = (deployer_address) => [
    "Dev License Pool",
    "DLP",
    5000,
    ethers.utils.parseEther('0.02'),
    ["0x5F408676D10e85AcE14342e332f3ffE328f8Ae7d", deployer_address],
    [25, 75]
]