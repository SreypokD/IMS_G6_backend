const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const stockController = require("../controllers/stockController");
const { validateStock } = require("../middleware/stockValidator");

router.get("/", auth, stockController.getAll);
router.post("/", auth, validateStock, stockController.create);
router.get("/summary", auth, stockController.summary);

module.exports = router;
