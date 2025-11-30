import mongoose from "mongoose";
import Bettor from "../models/bettors/bettor.model.js"

export const placeBet = async(req, res) => {
    try {
        const walletAddress = req.walletAddress
        const {marketShortId, title, predictedYes, betAmountUSD } = req.body

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
        return res.status(200).json({bettor})

        // 
    } catch (error) {
        return res.status(500).json({error: error.message})
    }
}