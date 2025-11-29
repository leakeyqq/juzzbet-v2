import express from "express";
const router = express.Router();

import { requireAuth } from "../middleware/auth.middleware.js";
import {createMarket} from "../controllers/market.controller.js"


router.post("/create", requireAuth, createMarket);

export default router;
