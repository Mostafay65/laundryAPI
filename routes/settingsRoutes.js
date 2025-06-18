import express from "express";
import { updateVAT, getVAT } from "../controllers/settingsController.js";
import authorize from "../middleware/authorize.js";
import roles from "../helpers/roles.js";

const router = express.Router();


router.patch("/vat", authorize(roles.admin), updateVAT);
router.get("/vat", getVAT);

export default router;
