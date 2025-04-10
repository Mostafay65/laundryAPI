import express from "express";
import {
  getAllItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
} from "../controllers/itemController.js";
import authorize from "../middleware/authorize.js";
import roles from "../helpers/roles.js";

const router = express.Router();

// Public routes for all users - anyone loged in user can view items
router.use(authorize());

router.get("/", getAllItems);
router.get("/:id", getItem);

// Protected routes - only authenticated users with admin role can modify items
router.use(authorize(roles.admin));

router.post("/", createItem);
router.patch("/:id", updateItem);
router.delete("/:id", deleteItem);

export default router;
