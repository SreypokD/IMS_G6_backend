const Product = require("../models/Product");
const OrderRequest = require("../models/OrderRequest");
const { Op } = require("sequelize");

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
