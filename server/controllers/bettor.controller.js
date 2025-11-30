import mongoose from "mongoose";
import Bettor from "../models/bettors/bettor.model.js"
import Market from "../models/markets/market.model.js"

export const placeBet = async(req, res) => {
    try {
        const walletAddress = req.walletAddress
        const {marketShortId, title, predictedYes, betAmountUSD } = req.body

        let market = await Market.findOne({marketShortId}).exec()
        if(!market){throw new Error("Market does not exist")}

        // Find existing bettor or create a new one
        let bettor = await Bettor.findOne({ walletAddress }).exec()

        if (!bettor) {
            // Create new bettor if doesn't exist
            bettor = new Bettor({
                walletAddress,
                myBets: []
            })
        }

        const newBet = {
            marketShortId,
            title,
            predictedYes,
            placedBetOn: new Date(),
            betAmountUSD
        }

        // Add the new bet to the bettor's myBets array
        bettor.myBets.push(newBet)

        // Save the bettor document
        bettor = await bettor.save()

        // Update market bets and totals
        if (predictedYes) {
            // Add to yesBets
            market.bets.yesBets.push({
                walletAddress,
                amount: betAmountUSD
            });
            // Update totalYesBets
            market.totalYesBets = (Number(market.totalYesBets) + betAmountUSD).toString();
        } else {
            // Add to noBets
            market.bets.noBets.push({
                walletAddress,
                amount: betAmountUSD
            });
            // Update totalNoBets
            market.totalNoBets = (Number(market.totalNoBets) + betAmountUSD).toString();
        }

        // Save both documents in a transaction
        market = await market.save();

        return res.status(200).json({bettor, market})

        // 
    } catch (error) {
        console.error(error)
        return res.status(500).json({error: error.message})
    }
}