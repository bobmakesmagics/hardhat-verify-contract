// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";

contract DevToken is ERC20, Ownable, PaymentSplitter {
    uint8 private _decimals = 8;
    uint256 public licensePrice;
    uint256 public totalPoolSupply;
    uint256 public roundDays = 365;
    uint256 public licensesIssuedToday = 0;
    address adminAddress;
    uint256 public lastDistribution = block.timestamp;

    struct License {
        address walletAddress;
        uint256 amount;
    }

    License[] public licenses;

    event LicensePurchased(
        address indexed buyer,
        address indexed token,
        uint256 price
    );
    event PriceUpdated(uint256 price);

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint256 initialLicencePrice,
        address[] memory payees,
        uint256[] memory shares
    ) payable ERC20(name, symbol) PaymentSplitter(payees, shares) {
        _mint(payees[0], (initialSupply * (10 ** _decimals)) / 2);
        _mint(payees[1], (initialSupply * (10 ** _decimals)) / 2);
        totalPoolSupply = (initialSupply * (10 ** _decimals)) / 2;
        licensePrice = initialLicencePrice;
        adminAddress = payees[0];
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
        emit LicensePurchased(msg.sender, address(this), amount);
    }

    function distributeTokens() public {
        require(
            block.timestamp >= lastDistribution + 1 days,
            "Not yet time for distribution."
        );
        uint256 tokensToDistribute = totalPoolSupply /
            roundDays /
            licensesIssuedToday;
        for (uint i = 0; i < licenses.length; i++) {
            License memory license = licenses[i];
            if (license.amount > 0) {
                transfer(
                    license.walletAddress,
                    tokensToDistribute * license.amount
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
}
