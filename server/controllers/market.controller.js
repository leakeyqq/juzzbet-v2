import mongoose from "mongoose"
import Market from "../models/markets/market.model.js"
import User from "../models/users/user.model.js"

export const createMarket = async(req, res) => {
    try {
        const {coverImage, title, description, betStartTime, betEndTime, betResolvedOn, judges,marketVisibility, timezone, marketId } = req.body
        console.log('req.body ', req.body)

        // details of creator
        const userWalletAddress = req.walletAddress
        let user = await User.findOne({ethAddress: userWalletAddress}).lean().exec()
        console.log('user is ', user)
        if(!user){
            throw new Error('Cannot find info of the creator')
        }

        let marketShortId = generateSixCharCode()
        let existingMarketShortId = await Market.findOne({marketShortId}).lean().exec()

        while(existingMarketShortId){
            marketShortId = generateSixCharCode()
            existingMarketShortId = await Market.findOne({marketShortId}).lean().exec()
        }

        let newMarket = new Market({
            title,
            marketShortId,
            description,
            coverImage,
            createdBy: {
                walletAddress: userWalletAddress,
                userId: user._id,
                names: user.names,
                email: user.email,
                profilePhoto: user.profileImage
            },
            bettingStartsAt: betStartTime,
            bettingEndsAt: betEndTime,
            bettingResolvesAt: betResolvedOn,
            judgesEmails: judges,
            publicity: {
                forThePublic: marketVisibility === "public", // true if public, false if private
                reviewNeeded: marketVisibility === "public", // needs review only if public
                passedReview: false, // default to false, will be updated after admin review
                comments: "" // empty initially
            },
            timezoneOfCreator: timezone,
            blockchain: {
                network: "celo",
                marketId: marketId
            }
        })

        newMarket = await newMarket.save()
        return res.status(200).json({newMarket})
    } catch (error) {
        console.error(error)
        return res.status(500).json({error: error.message})
    }
}
export const allMarkets = async(req, res) => {
    try {
        const allMarkets = await Market.find({}, {bets: 0}).lean().exec()
        return res.status(200).json({markets: allMarkets})
    } catch (error) {
        return res.status(500).json({error: error.message})
    }
}

function generateSixCharCode() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }

    return result;
}