const Stock = require("../models/Stock");
const Product = require("../models/Product");
const User = require("../models/User");
const { Op } = require("sequelize");

// Get all stock movements (with filters, pagination)
exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const where = {};
    if (req.query.type && req.query.type !== "All Transactions") {
      where.type = req.query.type === "Stock In" ? "in" : "out";
    }
    if (req.query.product) {
      where.product_id = req.query.product;
    }
    if (req.query.user) {
      where.user_id = req.query.user;
    }
    if (req.query.location && req.query.location !== "All Locations") {
      where.location = req.query.location;
    }
    if (req.query.startDate && req.query.endDate) {
      where.completed_at = {
        [Op.between]: [
          new Date(req.query.startDate),
          new Date(req.query.endDate),
        ],
      };
    }
    const totalItems = await Stock.count({ where });
    const totalPages = Math.ceil(totalItems / limit);
    const stocks = await Stock.findAll({
      where,
      include: [
        { model: Product, as: "product" },
        { model: User, as: "user" },
      ],
      limit,
      offset,
      order: [["completed_at", "DESC"]],
    });
    res.json({
      success: true,
      data: stocks,
      pagination: { page, limit, totalItems, totalPages },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Create a stock in/out transaction
exports.create = async (req, res) => {
  try {
    const stock = await Stock.create(req.body);
    res.status(201).json({ success: true, data: stock });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get stock summary (totals, low stock, etc.)
exports.summary = async (req, res) => {
  try {
    // Total stock in
    const totalStockIn = await Stock.sum("quantity", { where: { type: "in" } });
    // Total stock out
    const totalStockOut = await Stock.sum("quantity", {
      where: { type: "out" },
    });
    // Current balance (sum of all stock in - stock out)
    const currentBalance = (totalStockIn || 0) - (totalStockOut || 0);
    // Low stock items (products with stock < 10)
    const lowStockItems = await Product.count({
      where: { stock: { [Op.lt]: 10 } },
    });
    res.json({
      totalStockIn: totalStockIn || 0,
      totalStockOut: totalStockOut || 0,
      currentBalance,
      lowStockItems,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
