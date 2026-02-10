const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

const checkPermission = require("../middleware/checkPermission");
const authenticateToken = require("../middleware/auth");

router.get(
  "/",
  authenticateToken,
  checkPermission("view_user"),
  userController.getAll,
);
router.put("/profile", authenticateToken, userController.updateProfile);
router.post(
  "/",
  authenticateToken,
  checkPermission("create_user"),
  userController.create,
);
router.get(
  "/:id",
  authenticateToken,
  checkPermission("view_user"),
  userController.getOne,
);
router.patch(
  "/:id",
  authenticateToken,
  checkPermission("update_user"),
  userController.update,
);
router.delete(
  "/:id",
  authenticateToken,
  checkPermission("delete_user"),
  userController.remove,
);

module.exports = router;
