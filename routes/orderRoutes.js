import express from "express";
import {
  getAllOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
} from "../controllers/orderController.js";
import authorize from "../middleware/authorize.js";
import roles from "../helpers/roles.js";

const router = express.Router({ mergeParams: true });

// All order routes require authentication
router.use(authorize());

// Routes accessible to all authenticated users
router
  .route("/")
  .get(getAllOrders)
  .post(authorize(roles.user), createOrder);

router
  .route("/:id")
  .get(getOrder)
  .patch(updateOrder)
  .delete(deleteOrder);

export default router;