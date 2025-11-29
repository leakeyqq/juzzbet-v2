import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    ethAddress: {
        type: String,
        lowercase: true,
        trim: true,
        required: true
    },
    email: {
        type: String,
        required: false
    },
    names: {
        type: String,
        required: false
    },
    profileImage: {
        type: String,
        required: false
    },
    typeOfLogin: {
        type: String,
        required: true
    }
},  { timestamps: true })

const User = mongoose.model("users", userSchema, "users")
export default User