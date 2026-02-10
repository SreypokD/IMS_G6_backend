const { Op } = require("sequelize");
const User = require("../models/User");
const Product = require("../models/Product");
const Stock = require("../models/Stock");
const ActivityLog = require("../models/ActivityLog");
const OrderRequest = require("../models/OrderRequest");
const Supplier = require("../models/Supplier");
const Sale = require("../models/Sale");
const SaleItem = require("../models/SaleItem");
const Expense = require("../models/Expense");
const { sequelize } = require("../models");

exports.trends = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trends = await Stock.findAll({
      attributes: [
        [sequelize.fn("DATE", sequelize.col("completed_at")), "date"],
        "type",
        [sequelize.fn("SUM", sequelize.col("quantity")), "total"],
      ],
      where: {
        completed_at: {
          [Op.gte]: sevenDaysAgo,
        },
      },
      group: ["date", "type"],
      order: [["date", "ASC"]],
      raw: true,
    });

    // Process data to match chart format
    const chartData = [];
    const dateMap = new Map();

    // Initialize last 7 days with 0
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      dateMap.set(dateStr, { name: dateStr, in: 0, out: 0 });
    }

    trends.forEach((t) => {
      if (dateMap.has(t.date)) {
        const entry = dateMap.get(t.date);
        if (t.type === "in") entry.in = Number(t.total);
        else if (t.type === "out") entry.out = Number(t.total);
      }
    });

    // Convert map to array and reverse to show oldest first
    res.json({
      success: true,
      data: Array.from(dateMap.values()).sort(
        (a, b) => new Date(a.name) - new Date(b.name),
      ),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

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
    const startDate = new Date(from);
    const endDate = new Date(to);
    endDate.setHours(23, 59, 59, 999);
    where.createdAt = { [Op.between]: [startDate, endDate] };
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
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { [Op.between]: [start, end] };
    }

    // Get total count
    const totalItems = await ActivityLog.count({ where });
    const totalPages = Math.ceil(totalItems / limit);

    const logs = await ActivityLog.findAll({
      where,
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
exports.financialSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    const expenseDateFilter = {};

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      dateFilter.completed_at = { [Op.between]: [start, end] };
      expenseDateFilter.date = { [Op.between]: [start, end] };
    }

    const sales = await Sale.findAll({
      where: { ...dateFilter, status: "completed" },
      include: [{ model: SaleItem, as: "items" }],
    });

    let totalRevenue = 0;
    let totalCOGS = 0;

    sales.forEach((sale) => {
      if (sale.items && sale.items.length > 0) {
        sale.items.forEach((item) => {
          const qty = Number(item.quantity) || 0;
          const price = Number(item.price) || 0;
          const cost = Number(item.cost_price) || 0;
          const discount = Number(item.discount) || 0;

          const itemRevenue = price * qty * (1 - discount / 100);
          const itemCost = cost * qty;

          totalRevenue += itemRevenue;
          totalCOGS += itemCost;
        });
      } else {
        const qty = Number(sale.quantity) || 0;
        const price = Number(sale.price) || 0;
        const discount = Number(sale.discount) || 0;
        totalRevenue += price * qty * (1 - discount / 100);
      }
    });

    const totalExpenses =
      (await Expense.sum("amount", {
        where: expenseDateFilter,
      })) || 0;

    const grossProfit = totalRevenue - totalCOGS;
    const netProfit = grossProfit - totalExpenses;

    res.json({
      success: true,
      data: {
        revenue: totalRevenue,
        cogs: totalCOGS,
        grossProfit,
        expenses: totalExpenses,
        netProfit,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
