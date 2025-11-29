// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./manageCurrencies.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

using SafeERC20 for IERC20Metadata;

contract CreateMarket is ReentrancyGuard, ManageCurrencies {
    constructor(address initialOwner) ManageCurrencies(initialOwner) {}

    struct Bet {
        address bettor;
        uint256 amount;
        uint256 timestamp;
    }
    enum Outcome {
        Pending,
        YesWon,
        NoWon,
        Cancelled
    }

    struct Market {
        uint256 id;
        address marketCreator;
        address token;
        Bet[] yesBets;
        Bet[] noBets;
        bool isResolved;
        Outcome outcome;
    }

    // State variables
    mapping(uint256 => Market) public markets;
    uint256 public marketCount;

    event MarketCreated(
        uint256 indexed marketId,
        address indexed creator,
        address indexed token
    );

    function createMarket(
        address token
    ) external nonReentrant returns (uint256) {
        // Check if the token is supported
        require(token != address(0), "Invalid token address");
        require(supportedCurrencies[token], "Token is not supported");

        uint256 marketId = marketCount;

        markets[marketId].id = marketId;
        markets[marketId].marketCreator = msg.sender;
        markets[marketId].token = token;
        markets[marketId].isResolved = false;
        markets[marketId].outcome = Outcome.Pending;

        marketCount++;
        emit MarketCreated(marketId, msg.sender, token);
        return marketId;
    }
}
