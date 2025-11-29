import mongoose from "mongoose"

const marketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: false
    },
    marketShortId: {
        type: String,
        unique: true,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    coverImage: {
        type: String,
        required: false
    },
    createdBy: {
        walletAddress: {
            type: String,
            required: true
        },
        userId: {
            type: String,
            required: true
        },
        names: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        profilePhoto: {
            type: String,
            required: false
        }
    },
    bettingStartsAt: {
        type: Date,
        required: false
    },
    bettingEndsAt: {
        type: Date,
        required: false
    },
    bettingResolvesAt: {
        type: Date,
        required: false
    },
    judges: [{
        emailAddress: {
            type: String,
            required: false,
        },
        walletAddress: {
            type: String,
            required: false
        },
        userId: {
            type: String,
            required: false
        }
    }],
    judgesEmails: [{
        _id: false,
        type: String,
        required: false
    }],
    publicity: {
        forThePublic: {
            type: Boolean,
            required: false
        },
        reviewNeeded: {
            type: Boolean,
            default: false
        },
        passedReview: {
            type: Boolean,
            default: false
        },
        comments: {
            type: String,
            required: false
        }
    },
    blockchain: {
        network: {
            type: String,
            enum: ["celo"],
            required: false
        },
        marketId: {
            type: String,
            required: false
        }
    },
    totalYesBets: {
            type: String,
            default: "0",
    },
    timezoneOfCreator: {
        type: String, 
        required: false
    },
    totalNoBets: {
        type: String,
        default: "0",
    },
    bets: {
        yesBets: [{
            walletAddress: {
                type: String,
                required: false
            },
            amount: {
                type: Number,
                required: false
            }
        }],
        noBets: [{
            walletAddress: {
                type: String,
                required: false
            },
            amount: {
                type: Number,
                required: false
            }
        }]
    },
    marketOutcome: {
        type: String,
        enum: ["pending", "cancelled", "yesWon", "noWon"],
        default: "pending"
    }

}, { timestamps: true })

const Market = mongoose.model("markets", marketSchema, "markets")
export default Market