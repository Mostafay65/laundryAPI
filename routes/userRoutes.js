import express from "express";
import authorize from "../middleware/authorize.js";
import multer from "multer";
import {
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from "../controllers/userController.js";
import roles from "../helpers/roles.js";

const setUserId = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

const router = express.Router();
const upload = multer();

// Authentication
router.use(authorize());

router
  .route("/me")
  .get(getUser)
  .patch(setUserId, upload.none(), updateUser)
  .delete(setUserId, deleteUser);

// Administration
router.use(authorize(roles.admin));

router.get("/", getAllUsers);
router.route("/:id").patch(upload.none(), updateUser).delete(deleteUser);

export default router;
