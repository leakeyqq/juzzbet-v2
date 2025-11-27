import jwt from "jsonwebtoken";
import dotenv from "dotenv"
import User from "../models/users/user.model.js"

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d"; // or whatever you want

export const login = async (req, res) => {
  // console.log('User trying to log in')
  const { ethAddress, names, email, profileImage, typeOfLogin } = req.body;

  if (!ethAddress) {
    // console.log('no address')
    return res.status(400).json({ error: "Wallet address is required" });
  }

  try{
    let user = await User.findOne({ethAddress}).exec()
    // console.log('user is ', user)

    if(!user){
      // console.log('no user found, creating a user now')
      user = await User.create({
        ethAddress, names, email, profileImage, typeOfLogin
      })
    }

  const _userId = user._id
  const token = jwt.sign({ _userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .json({ success: true, ethAddress, user });


  }catch(e){
    console.error(e)
    return res.status(500).json({error: e.message})
  }

};

export const logout = (req, res) => {
  res.clearCookie("token").json({ success: true, message: "Logged out" });
};

export const getMe = (req, res) => {
  const user = req.user;
  res.json({ success: true, user });
};
