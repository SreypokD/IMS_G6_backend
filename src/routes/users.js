const express = require("express");
const router = express.Router();
const checkPermission = require("../middleware/checkPermission");
const {
  getAll,
  getOne,
  create,
  update,
  remove,
} = require("../controllers/userController");

// User management routes
router.get("/", checkPermission("view_user"), getAll);
router.post("/", checkPermission("create_user"), create);
router.get("/:id", checkPermission("view_user"), getOne);
router.put("/:id", checkPermission("update_user"), update);
router.delete("/:id", checkPermission("delete_user"), remove);
module.exports = router;
