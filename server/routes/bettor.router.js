import express from 'express'
const router = express.Router()

import {requireAuth} from "../middleware/auth.middleware.js"
import {placeBet} from "../controllers/bettor.controller.js"

router.post("/placeBet", requireAuth, placeBet)

export default router