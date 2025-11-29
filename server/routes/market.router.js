import express from "express";
const router = express.Router();

import { requireAuth } from "../middleware/auth.middleware.js";
import {createMarket, allMarkets} from "../controllers/market.controller.js"


router.post("/create", requireAuth, createMarket);
router.get("/all", allMarkets)

export default router;
