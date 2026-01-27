const OrderRequest = require("../models/OrderRequest");
const Product = require("../models/Product");
const User = require("../models/User");

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const totalItems = await OrderRequest.count();
    const totalPages = Math.ceil(totalItems / limit);
    const orders = await OrderRequest.findAll({
      include: [Product, { model: User, as: "requester" }],
      limit,
      offset,
      order: [["_id", "ASC"]],
    });
    res.json({
      success: true,
      data: orders,
      pagination: { page, limit, totalItems, totalPages },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.create = async (req, res) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  try {
    const order = await OrderRequest.create({
      ...req.body,
      requesterId: req.user._id,
    });
    res.status(201).json({success: true, data: order});
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const order = await OrderRequest.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: "Not found" });
    order.status = req.body.status;
    await order.save();
    res.json({success: true, data: order});
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
