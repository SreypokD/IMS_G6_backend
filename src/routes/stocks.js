const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const stockController = require("../controllers/stockController");

router.get("/", auth, stockController.getAll);
router.post("/", auth, stockController.create);
router.get("/summary", auth, stockController.summary);

module.exports = router;
