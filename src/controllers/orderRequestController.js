const ActivityLog = require("../models/ActivityLog");
const Notification = require("../models/Notification");
const OrderRequest = require("../models/OrderRequest");
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const User = require("../models/User");
const ApproveRequest = require("../models/ApproveRequest");
const ConfirmDelivery = require("../models/ConfirmDelivery");
const Stock = require("../models/Stock");
const OrderRequestItem = require("../models/OrderRequestItem");

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    // Allow status filter from query or route (for approve/confirm delivery)
    let status = req.query.status;
    if (req.status) status = req.status;
    if (
      arguments.length > 2 &&
      typeof arguments[2] === "object" &&
      arguments[2].status
    ) {
      status = arguments[2].status;
    }
    const where = {};
    if (status) where.status = status;
    const totalItems = await OrderRequest.count({ where });
    const totalPages = Math.ceil(totalItems / limit);
    const orders = await OrderRequest.findAll({
      where,
      include: [
        {
          model: OrderRequestItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
        { model: User, as: "requester" },
        { model: ApproveRequest, as: "approve_request" },
        { model: ConfirmDelivery, as: "confirm_delivery" },
      ],
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
    // Create the order request (without product_id)
    const { orderItems, ...orderData } = req.body;
    const order = await OrderRequest.create({
      ...orderData,
      requester_id: req.user._id,
      status: "pending",
    });
    // Create order items
    if (Array.isArray(orderItems)) {
      for (const item of orderItems) {
        await OrderRequestItem.create({
          order_request_id: order._id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
        });
      }
    }
    // Populate order with items
    const populated = await OrderRequest.findByPk(order._id, {
      include: [
        {
          model: OrderRequestItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
        { model: User, as: "requester" },
        { model: ApproveRequest, as: "approve_request" },
        { model: ConfirmDelivery, as: "confirm_delivery" },
      ],
    });
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const order = await OrderRequest.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: "Not found" });
    const {
      status,
      rejection_reason,
      admin_remarks,
      customer_remark,
      delivery_date,
    } = req.body;
    const user_id = req.user?._id || (req.user && req.user._id);
    if (status === "approved") {
      if (admin_remarks) order.admin_remarks = admin_remarks;
      if (admin_remarks) order.admin_remark = admin_remarks;
      order.approved_by = user_id;
      order.approved_date = new Date();
      // Check available stock (not reserved)
      const product = await Product.findByPk(order.product_id);
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
      await Stock.create({
        product_id: product._id,
        user_id,
        type: "out",
        quantity: order.quantity,
        balance: product.stock - product.reserved_stock, // show available after reservation
        location: order.location || null,
        completed_at: new Date(),
        note: `Reserved for order approval (#${order._id})`,
      });
      order.status = "approved";
      order.rejection_reason = null;
      order.notified = false;
      await order.save();
      let approveRequest = await ApproveRequest.findOne({
        where: { order_request_id: order._id },
      });
      if (!approveRequest) {
        approveRequest = await ApproveRequest.create({
          order_request_id: order._id,
          status: "approved",
          admin_remarks: admin_remarks || null,
          approved_by: user_id,
          approved_date: order.approved_date,
        });
      } else {
        approveRequest.status = "approved";
        approveRequest.admin_remarks =
          admin_remarks || approveRequest.admin_remarks;
        approveRequest.approved_by = user_id;
        approveRequest.approved_date = order.approved_date;
        await approveRequest.save();
      }
      // Log activity
      await ActivityLog.create({
        user_id,
        action: "approve_order_request",
        details: `OrderRequest ${order._id} approved. Reserved ${order.quantity} units of product ${product._id}.`,
        entity_type: "OrderRequest",
        entity_id: order._id,
      });
      // Notify requester
      await Notification.create({
        user_id: order.requester_id,
        type: "order_approved",
        message: `Your order request #${order._id} has been approved.`,
        entity_type: "OrderRequest",
        entity_id: order._id,
      });
      const orderRequest = await OrderRequest.findByPk(order._id, {
        include: [
          { model: Product, as: "product" },
          { model: User, as: "requester" },
          { model: User, as: "approvedBy", foreignKey: "approved_by" },
          { model: User, as: "updatedBy", foreignKey: "updated_by" },
          { model: ApproveRequest, as: "approve_request" },
          { model: ConfirmDelivery, as: "confirm_delivery" },
        ],
      });
      // Populate *_id fields as objects
      const data = orderRequest.toJSON();
      if (data.product) data.product_id = data.product;
      if (data.requester) data.requester_id = data.requester;
      if (data.approvedBy) data.approved_by = data.approvedBy;
      if (data.updatedBy) data.updated_by = data.updatedBy;
      return res.json({ success: true, data, sale: sale });
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
      let approveRequest = await ApproveRequest.findOne({
        where: { order_request_id: order._id },
      });
      if (!approveRequest) {
        approveRequest = await ApproveRequest.create({
          order_request_id: order._id,
          status: "rejected",
          admin_remarks: admin_remarks || null,
          rejection_reason: rejection_reason || "",
          approved_by: user_id,
        });
      } else {
        approveRequest.status = "rejected";
        approveRequest.admin_remarks =
          admin_remarks || approveRequest.admin_remarks;
        approveRequest.rejection_reason =
          rejection_reason || approveRequest.rejection_reason;
        approveRequest.approved_by = user_id;
        await approveRequest.save();
      }
      // Log activity
      await ActivityLog.create({
        user_id,
        action: "reject_order_request",
        details: `OrderRequest ${order._id} rejected. Reason: ${order.rejection_reason}`,
        entity_type: "OrderRequest",
        entity_id: order._id,
      });
      // Notify requester
      await Notification.create({
        user_id: order.requester_id,
        type: "order_rejected",
        message: `Your order request #${order._id} has been rejected. Reason: ${order.rejection_reason}`,
        entity_type: "OrderRequest",
        entity_id: order._id,
      });
      const orderRequest = await OrderRequest.findByPk(order._id, {
        include: [
          { model: Product, as: "product" },
          { model: User, as: "requester" },
          { model: User, as: "approvedBy", foreignKey: "approved_by" },
          { model: User, as: "updatedBy", foreignKey: "updated_by" },
          { model: ApproveRequest, as: "approve_request" },
          { model: ConfirmDelivery, as: "confirm_delivery" },
        ],
      });
      const data = orderRequest.toJSON();
      if (data.product) data.product_id = data.product;
      if (data.requester) data.requester_id = data.requester;
      if (data.approvedBy) data.approved_by = data.approvedBy;
      if (data.updatedBy) data.updated_by = data.updatedBy;
      return res.json({ success: true, data });
    } else if (status === "completed") {
      // Mark sales order as completed and deduct stock
      const sale = await Sale.findOne({
        where: { order_request_id: order._id },
      });
      if (!sale) return res.status(404).json({ error: "Sales not found" });
      const product = await Product.findByPk(order.product_id);
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
      await Stock.create({
        product_id: product._id,
        user_id,
        type: "out",
        quantity: order.quantity,
        balance: product.stock,
        location: order.location || null,
        completed_at: new Date(),
        note: `Deducted for order completion (#${order._id})`,
      });
      // Log activity
      await ActivityLog.create({
        user_id,
        action: "complete_order_request",
        details: `OrderRequest ${order._id} completed. Deducted ${order.quantity} units from product ${product._id}.`,
        entity_type: "OrderRequest",
        entity_id: order._id,
      });
      // Notify requester
      await Notification.create({
        user_id: order.requester_id,
        type: "order_completed",
        message: `Your order request #${order._id} has been completed.`,
        entity_type: "OrderRequest",
        entity_id: order._id,
      });
      // Populate Product and requester
      const populated = await OrderRequest.findByPk(order._id, {
        include: [
          { model: Product, as: "product" },
          { model: User, as: "requester" },
          { model: User, as: "approvedBy", foreignKey: "approved_by" },
          { model: User, as: "updatedBy", foreignKey: "updated_by" },
          { model: ApproveRequest, as: "approve_request" },
          { model: ConfirmDelivery, as: "confirm_delivery" },
        ],
      });
      const o = populated.toJSON();
      if (o.product) o.product_id = o.product;
      if (o.requester) o.requester_id = o.requester;
      if (o.approvedBy) o.approved_by = o.approvedBy;
      if (o.updatedBy) o.updated_by = o.updatedBy;
      return res.json({ success: true, data: o, sale });
    } else if (status === "on_hold") {
      order.status = "on_hold";
      if (customer_remark) order.customer_remark = customer_remark;
      if (delivery_date) order.delivery_date = delivery_date;
      order.updated_by = user_id;
      order.updated_at = new Date();
      await order.save();
      await ActivityLog.create({
        user_id,
        action: "hold_order_request",
        details: `OrderRequest ${order._id} put on hold.`,
        entity_type: "OrderRequest",
        entity_id: order._id,
      });
      // Notify requester
      await Notification.create({
        user_id: order.requester_id,
        type: "order_on_hold",
        message: `Your order request #${order._id} is on hold.`,
        entity_type: "OrderRequest",
        entity_id: order._id,
      });
      // Populate Product and requester
      const populated = await OrderRequest.findByPk(order._id, {
        include: [
          { model: Product, as: "product" },
          { model: User, as: "requester" },
          { model: User, as: "approvedBy", foreignKey: "approved_by" },
          { model: User, as: "updatedBy", foreignKey: "updated_by" },
          { model: ApproveRequest, as: "approve_request" },
          { model: ConfirmDelivery, as: "confirm_delivery" },
        ],
      });
      const o = populated.toJSON();
      if (o.product) o.product_id = o.product;
      if (o.requester) o.requester_id = o.requester;
      if (o.approvedBy) o.approved_by = o.approvedBy;
      if (o.updatedBy) o.updated_by = o.updatedBy;
      return res.json({ success: true, data: o });
    } else {
      // For other statuses, just update
      order.status = status;
      if (customer_remark) order.customer_remark = customer_remark;
      if (delivery_date) order.delivery_date = delivery_date;
      order.updated_by = user_id;
      order.updated_at = new Date();
      await order.save();
      // Notify requester
      await Notification.create({
        user_id: order.requester_id,
        type: `order_${status}`,
        message: `Your order request #${order._id} status updated to ${status}.`,
        entity_type: "OrderRequest",
        entity_id: order._id,
      });
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
    // Notify admin(s) - for demo, notify all admins (could be improved)
    const admins = await User.findAll({ where: { role: "admin" } });
    for (const admin of admins) {
      await Notification.create({
        user_id: admin._id,
        type: "order_cancelled",
        message: `Order request #${order._id} was cancelled by the customer`,
        entity_type: "OrderRequest",
        entity_id: order._id,
      });
    }
    const orderRequest = await OrderRequest.findByPk(order._id, {
      include: [
        { model: Product, as: "product" },
        { model: User, as: "requester" },
      ],
    });
    res.json({ success: true, data: orderRequest });
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
    // Notify requester
    await Notification.create({
      user_id: order.requester_id,
      type: "order_delivered",
      message: `Your order request #${order._id} has been delivered.`,
      entity_type: "OrderRequest",
      entity_id: order._id,
    });
    let confirmDelivery = await ConfirmDelivery.findOne({
      where: { order_request_id: order._id },
    });
    if (!confirmDelivery) {
      confirmDelivery = await ConfirmDelivery.create({
        order_request_id: order._id,
        status: "delivered",
        confirmed_by: req.user._id,
        confirmed_at: new Date(),
      });
    } else {
      confirmDelivery.status = "delivered";
      confirmDelivery.confirmed_by = req.user._id;
      confirmDelivery.confirmed_at = new Date();
      await confirmDelivery.save();
    }
    await ActivityLog.create({
      user_id: req.user._id,
      action: "confirm_delivery",
      details: `OrderRequest ${order._id} delivery confirmed`,
      entity_type: "OrderRequest",
      entity_id: order._id,
    });
    // Notify requester
    await Notification.create({
      user_id: order.requester_id,
      type: "order_delivered",
      message: `Your order request #${order._id} has been delivered.`,
      entity_type: "OrderRequest",
      entity_id: order._id,
    });
    const orderRequest = await OrderRequest.findByPk(order._id, {
      include: [
        { model: Product, as: "product" },
        { model: User, as: "requester" },
        { model: ApproveRequest, as: "approve_request" },
        { model: ConfirmDelivery, as: "confirm_delivery" },
      ],
    });
    res.json({ success: true, data: orderRequest });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
