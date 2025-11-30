import mongoose from "mongoose";

const bettorSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: false
    },
    myBets: [{
        marketShortId: {
            type: String,
            required: false
        },
        title: {
            type: String,
            required: false
        },
        predictedYes: {
            type: Boolean,
            required: false
        },
        placedBetOn: {
            type: Date,
            required: false
        },
        betAmountUSD: {
            type: String,
            required: false
        },
        marketOutcome: {
            type: String,
            default: "pending",
            enum: ["pending", "cancelled", "yesWon", "noWon"],
        }
    }]
}, {timestamps: true})

const Bettor = mongoose.model("bettors", bettorSchema, "bettors")
export default Bettor