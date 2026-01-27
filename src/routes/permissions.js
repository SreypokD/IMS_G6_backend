const express = require("express");
const router = express.Router();
const { getAll, update } = require("../controllers/permissionsController");

// Permissions routes
router.get("/permissions", getAll);
router.put("/permissions", update);

module.exports = router;
