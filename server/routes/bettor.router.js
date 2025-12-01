import express from 'express'
const router = express.Router()

import {requireAuth} from "../middleware/auth.middleware.js"
import {placeBet, myBets} from "../controllers/bettor.controller.js"

router.post("/placeBet", requireAuth, placeBet)
router.get('/myBets', requireAuth, myBets)
export default router