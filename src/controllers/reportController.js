const { Op } = require("sequelize");
const User = require("../models/User");
const Product = require("../models/Product");
const ActivityLog = require("../models/ActivityLog");
const OrderRequest = require("../models/OrderRequest");
const Supplier = require("../models/Supplier");

exports.inventorySummary = async (req, res) => {
  const totalSuppliers = await Supplier.count();
  const products = await Product.findAll();
  const totalProducts = products.length;
  const totalQuantity = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStock = products.filter((p) => p.stock <= 10).length;
  res.json({ totalProducts, totalQuantity, lowStock, totalSuppliers });
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

exports.activityLogs = async (req, res) => {
  try {
    // Parse pagination params
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const totalItems = await ActivityLog.count();
    const totalPages = Math.ceil(totalItems / limit);

    const logs = await ActivityLog.findAll({
      include: [{ model: User, as: "user" }],
      limit,
      offset,
      order: [["_id", "DESC"]],
    });
    res.json({
      success: true,
      data: logs,
      pagination: { page, limit, totalItems, totalPages },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch activity logs" });
  }
};
