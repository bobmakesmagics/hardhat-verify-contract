// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";

contract DevToken is ERC20, Ownable, PaymentSplitter {
    uint256 public licensePrice;
    uint256 public roundDays = 365;
    uint256 public licensesIssuedToday = 0;
    uint256 public totalLicenses = 0;
    address private adminAddress;
    uint8 private _decimals;
    uint256 public lastDistribution = block.timestamp;

    struct License {
        address walletAddress;
        uint256 amount;
    }

    License[] internal licenses;

    event LicensePurchased(
        address indexed buyer,
        address indexed token,
        uint256 amount
    );
    event PriceUpdated(uint256 price);

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimal,
        uint256 initialSupply,
        uint256 initialLicensePrice,
        address[] memory payees,
        uint256[] memory shares
    ) payable ERC20(name, symbol) PaymentSplitter(payees, shares) {
        _mint(payees[0], (initialSupply * (10 ** decimal)) / 2);
        _mint(payees[1], (initialSupply * (10 ** decimal)) / 2);
        licensePrice = initialLicensePrice;
        adminAddress = payees[0];
        _decimals = decimal;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function buyLicense(uint256 amount) public payable {
        uint256 cost = amount * licensePrice;
        require(amount <= balanceOf(owner()), "Not enough tokens.");
        require(
            getLicenseAmount(msg.sender) + amount <= 500,
            "Exceed the license limit to purchase."
        );
        require(msg.value >= cost, "Not enough crypto");

        release(payable(adminAddress));
        release(payable(owner()));
        licenses.push(License(msg.sender, amount));
        licensesIssuedToday += amount;
        totalLicenses += amount;
        emit LicensePurchased(msg.sender, address(this), amount);
    }

    function getTokenAmountToDistribute() public view returns (uint256) {
        require(licensesIssuedToday > 0, "No license issued yet.");
        uint256 poolSupply = getPoolSupply();
        uint256 tokensToDistribute = poolSupply /
            roundDays /
            licensesIssuedToday;
        return tokensToDistribute;
    }

    function distributeTokens() public {
        require(
            block.timestamp >= lastDistribution + 1 days,
            "Not yet time for distribution."
        );
        uint256 tokenAmountToDistribute = getTokenAmountToDistribute();
        for (uint i = 0; i < licenses.length; i++) {
            License memory license = licenses[i];
            if (license.amount > 0) {
                transfer(
                    license.walletAddress,
                    tokenAmountToDistribute * license.amount
                );
            }
        }
        licensesIssuedToday = 0;
        lastDistribution = block.timestamp;
    }

    function setLicensePrice(uint256 _price) public onlyOwner {
        licensePrice = _price;
        emit PriceUpdated(_price);
    }

    function setRoundDays(uint256 _days) public onlyOwner {
        roundDays = _days;
    }

    function getLicenseAmount(address account) public view returns (uint256) {
        for (uint i = 0; i < licenses.length; i++) {
            License memory license = licenses[i];
            if (license.walletAddress == account) {
                return license.amount;
            }
        }
        return 0;
    }

    function getPoolSupply() public view returns (uint256) {
        return balanceOf(adminAddress);
    }

    function burn(
        address account,
        uint256 amount
    ) public virtual onlyOwner returns (bool) {
        _burn(account, amount);
        return true;
    }
}
