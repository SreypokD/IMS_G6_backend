const ActivityLog = require("../models/ActivityLog");
const OrderRequest = require("../models/OrderRequest");
const Sale = require("../models/Sale");
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
  const { validationResult } = require("express-validator");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  try {
    const order = await OrderRequest.create({
      ...req.body,
      requester_id: req.user._id,
      requested_date: req.body.requested_date,
      notes: req.body.notes,
    });
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const order = await OrderRequest.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: "Not found" });
    const { status, rejection_reason, admin_remarks } = req.body;
    const user_id = req.user?._id || (req.user && req.user._id);
    if (status === "approved") {
      if (admin_remarks) order.admin_remarks = admin_remarks;
      // Check available stock (not reserved)
      const product = await Product.findByPk(
        order.product_id || order.product_id,
      );
      if (!product) return res.status(404).json({ error: "Product not found" });
      const availableStock = product.stock - product.reserved_stock;
      if (availableStock < order.quantity) {
        return res
          .status(400)
          .json({ error: "Insufficient stock for approval" });
      }
      // Reserve stock (do not reduce actual stock yet)
      product.reserved_stock += order.quantity;
      await product.save();
      // Create sale
      const sale = await Sale.create({
        order_request_id: order._id,
        product_id: product._id,
        quantity: order.quantity,
        status: "processing",
      });
      order.status = "approved";
      order.rejection_reason = null;
      order.notified = false;
      await order.save();
      // Log activity
      await ActivityLog.create({
        user_id,
        action: "approve_order_request",
        details: `OrderRequest ${order._id} approved. Reserved ${order.quantity} units of product ${product._id}.`,
        entity_type: "OrderRequest",
        entity_id: order._id,
      });
      return res.json({ success: true, data: order, sale: sale });
    } else if (status === "rejected") {
      if (admin_remarks) order.admin_remarks = admin_remarks;
      // Release reserved stock if previously approved
      if (order.status === "approved") {
        const product = await Product.findByPk(
          order.product_id || order.product_id,
        );
        if (product) {
          product.reserved_stock = Math.max(
            0,
            product.reserved_stock - order.quantity,
          );
          await product.save();
        }
      }
      order.status = "rejected";
      order.rejection_reason = rejection_reason || "";
      order.notified = false;
      await order.save();
      // Log activity
      await ActivityLog.create({
        user_id,
        action: "reject_order_request",
        details: `OrderRequest ${order._id} rejected. Reason: ${order.rejection_reason}`,
        entity_type: "OrderRequest",
        entity_id: order._id,
      });
      return res.json({ success: true, data: order });
    } else if (status === "completed") {
      // Mark sales order as completed and deduct stock
      const sale = await Sale.findOne({
        where: { order_request_id: order._id },
      });
      if (!sale) return res.status(404).json({ error: "Sales not found" });
      const product = await Product.findByPk(
        order.product_id || order.product_id,
      );
      if (!product) return res.status(404).json({ error: "Product not found" });
      // Deduct stock and release reserved
      product.stock = Math.max(0, product.stock - order.quantity);
      product.reserved_stock = Math.max(
        0,
        product.reserved_stock - order.quantity,
      );
      await product.save();
      sale.status = "completed";
      sale.completed_at = new Date();
      await sale.save();
      order.status = "completed";
      order.notified = false;
      await order.save();
      // Log activity
      await ActivityLog.create({
        user_id,
        action: "complete_order_request",
        details: `OrderRequest ${order._id} completed. Deducted ${order.quantity} units from product ${product._id}.`,
        entity_type: "OrderRequest",
        entity_id: order._id,
      });
      return res.json({ success: true, data: order, sale });
    } else {
      // For other statuses, just update
      order.status = status;
      await order.save();
      return res.json({ success: true, data: order });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.cancelOrderRequest = async (req, res) => {
  try {
    const order = await OrderRequest.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: "Not found" });
    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Only pending orders can be cancelled" });
    }
    if (String(order.requester_id) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ error: "Not authorized to cancel this order" });
    }
    order.status = "cancelled";
    await order.save();
    await ActivityLog.create({
      user_id: req.user._id,
      action: "cancel_order_request",
      details: `OrderRequest ${order._id} cancelled by customer`,
      entity_type: "OrderRequest",
      entity_id: order._id,
    });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Confirm delivery for an approved order
exports.confirmDelivery = async (req, res) => {
  try {
    const order = await OrderRequest.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: "Not found" });
    if (order.status !== "approved") {
      return res
        .status(400)
        .json({ error: "Only approved orders can be confirmed for delivery" });
    }
    order.status = "delivered";
    await order.save();
    await ActivityLog.create({
      user_id: req.user._id,
      action: "confirm_delivery",
      details: `OrderRequest ${order._id} delivery confirmed`,
      entity_type: "OrderRequest",
      entity_id: order._id,
    });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
