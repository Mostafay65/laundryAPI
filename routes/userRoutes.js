import express from "express";
import authorize from "../middleware/authorize.js";
import multer from "multer";
import {
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
  CreateUser,
} from "../controllers/userController.js";
import roles from "../helpers/roles.js";
import { set } from "mongoose";

const setUserId = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};
const setRole = (role) => (req, res, next) => {
  req.body.role = role;
  next();
};

const router = express.Router();
// const upload = multer();

// Authentication
router.use(authorize());

router
  .route("/me")
  .get(getUser)
  .patch(setUserId, updateUser)
  .delete(setUserId, deleteUser);

// Administration
router.use(authorize(roles.admin));

router.get("/:role", getAllUsers);
router.route("/:id").patch(updateUser).delete(deleteUser);
router.post("/delivery", setRole(roles.delivery), CreateUser);
router.post("/admin", setRole(roles.admin), CreateUser);

export default router;
