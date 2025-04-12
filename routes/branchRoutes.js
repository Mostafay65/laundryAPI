import express from "express";
import {
  getAllBranches,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch,
  getNearestBranches,
} from "../controllers/branchController.js";
import orderRouter from "./orderRoutes.js";
import authorize from "../middleware/authorize.js";
import roles from "../helpers/roles.js";

const router = express.Router();

router.use("/:branchId/orders", orderRouter);

// Public routes - anyone can view branches
router.get("/", getAllBranches);
router.get("/nearest", getNearestBranches);
router.get("/:id", getBranch);

// Protected routes - only authenticated users with admin role can modify branches
router.use(authorize(roles.admin));

router.post("/", createBranch);
router.patch("/:id", updateBranch);
router.delete("/:id", deleteBranch);

export default router;
