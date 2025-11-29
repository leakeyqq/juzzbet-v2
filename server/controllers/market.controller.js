import mongoose from "mongoose"
import Market from "../models/markets/market.model.js"

export const createMarket = async(req, res) => {
    try {
        // const {coverImage, title, description, betStartTime, betEndTime, betResolvedOn, judges} = req.body
        console.log('req.body ', req.body)
        return res.status(200).json({success: true})
    } catch (error) {
        console.error(error)
        return res.status(500).json({error: error.message})
    }
}