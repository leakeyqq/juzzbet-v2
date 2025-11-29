// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./createMarket.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

using SafeERC20 for IERC20Metadata;

contract PlaceBet is CreateMarket {
    constructor(address initialOwner) CreateMarket(initialOwner) {}

    // Events
    event BetPlaced(uint256 indexed marketId, address indexed bettor, uint256 amount, bool isYesBet, uint256 timestamp);

    function placeBet( uint256 marketID, uint256 amount, bool yesBet ) external nonReentrant returns (bool) {
        require(marketID < marketCount, "Market does not exist");
        Market storage market = markets[marketID];

        // Validate market state
        require(!market.isResolved, "Market is already resolved");
        require( market.outcome == Outcome.Pending, "Market outcome already determined" );
        require(amount > 0, "Bet amount must be greater than 0");

        IERC20Metadata erc20 = IERC20Metadata(market.token);

        // Transfer tokens from bettor to contract
        require(erc20.balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(erc20.allowance(msg.sender, address(this)) >= amount,"Insufficient allowance");

        erc20.safeTransferFrom(msg.sender, address(this), amount);

        // Create new bet
        Bet memory newBet = Bet({
            bettor: msg.sender,
            amount: amount,
            timestamp: block.timestamp
        });

        // Add bet to appropriate array
        if (yesBet) {
            market.yesBets.push(newBet);
        } else {
            market.noBets.push(newBet);
        }
        emit BetPlaced(marketID, msg.sender, amount, yesBet, block.timestamp);
        return true;
    }
}
