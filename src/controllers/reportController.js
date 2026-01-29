const { Op } = require("sequelize");
const Product = require("../models/Product");
const OrderRequest = require("../models/OrderRequest");
const ActivityLog = require("../models/ActivityLog");

exports.inventorySummary = async (req, res) => {
  const products = await Product.findAll();
  const totalProducts = products.length;
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
  res.json({ totalProducts, totalQuantity });
};

exports.orderStats = async (req, res) => {
  const { from, to } = req.query;
  const where = {};
  if (from && to) {
    where.createdAt = { [Op.between]: [new Date(from), new Date(to)] };
  }
  const totalOrders = await OrderRequest.count({ where });
  const pending = await OrderRequest.count({
    where: { ...where, status: "pending" },
  });
  const approved = await OrderRequest.count({
    where: { ...where, status: "approved" },
  });
  const rejected = await OrderRequest.count({
    where: { ...where, status: "rejected" },
  });
  res.json({ totalOrders, pending, approved, rejected });
};

// Fetch activity logs for report
exports.activityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.findAll({
      order: [["createdAt", "DESC"]],
      limit: 100,
    });
    res.json({ success: true, data: logs });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch activity logs" });
  }
};
