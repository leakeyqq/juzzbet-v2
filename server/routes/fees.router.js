import express from 'express'
const router = express.Router()

import {fundFeesOnWallet, customFundFeesOnWallet} from '../controllers/chainFees.controller.js'
import {requireAuth} from "../middleware/auth.middleware.js"


router.get('/prepare-deposit' , requireAuth, fundFeesOnWallet)
router.post('/gas-estimate', requireAuth, customFundFeesOnWallet)
export default router