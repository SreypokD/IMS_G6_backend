const express = require("express");
const router = express.Router();
const checkPermission = require("../middleware/checkPermission");
const authenticateToken = require("../middleware/auth");
const {
  getAll,
  getOne,
  create,
  update,
  remove,
} = require("../controllers/userController");

// User management routes
router.get("/", authenticateToken, checkPermission("view_user"), getAll);
router.post("/", authenticateToken, checkPermission("create_user"), create);
router.get("/:id", authenticateToken, checkPermission("view_user"), getOne);
router.put("/:id", authenticateToken, checkPermission("update_user"), update);
router.delete("/:id", authenticateToken, checkPermission("delete_user"), remove);
module.exports = router;
