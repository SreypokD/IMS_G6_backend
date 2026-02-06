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
    if (req.query.search) {
      const products = await Product.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${req.query.search}%` } },
            { code: { [Op.like]: `%${req.query.search}%` } },
          ],
        },
        attributes: ["_id"],
      });
      const productIds = products.map((p) => p._id);

      if (productIds.length > 0) {
        where.product_id = { [Op.in]: productIds };
      } else {
        where.product_id = "non-existent-id";
      }
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
  const transaction = await Stock.sequelize.transaction();
  try {
    const {
      product_id,
      type,
      quantity,
      reason,
      batch_number,
      location,
      note,
      completed_at,
      user_id,
    } = req.body;

    // ... validation logic (product existence etc) ...
    const product = await Product.findByPk(product_id, { transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ error: "Product not found" });
    }

    // Calculate new stock level
    let newStock = product.stock;
    if (type === "in") {
      newStock += Number(quantity);
    } else {
      // Assuming 'out' if not 'in' based on the provided snippet, but original had 'else if (type === "out")' and 'else' for invalid type.
      if (product.stock < quantity) {
        await transaction.rollback();
        return res.status(400).json({ error: "Insufficient stock" });
      }
      newStock -= Number(quantity);
    }

    // Update product stock
    await product.update({ stock: newStock }, { transaction });

    // Create stock record
    const stock = await Stock.create(
      {
        product_id,
        user_id: user_id || req.user.id,
        type,
        quantity,
        balance: newStock,
        reason,
        batch_number,
        location,
        note,
        completed_at: completed_at || new Date(),
      },
      { transaction },
    );

    await transaction.commit();
    res.status(201).json(stock);
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ error: err.message });
  }
};

// Get stock summary (totals, low stock, etc.)
exports.summary = async (req, res) => {
  try {
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
    if (req.query.search) {
      // Find matching products first
      const products = await Product.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${req.query.search}%` } },
            { code: { [Op.like]: `%${req.query.search}%` } },
          ],
        },
        attributes: ["_id"],
      });
      const productIds = products.map((p) => p._id);

      if (productIds.length > 0) {
        where.product_id = { [Op.in]: productIds };
      } else {
        where.product_id = "non-existent-id";
      }
    }

    // Total stock in (filtered)
    const stockInWhere = { ...where, type: "in" };
    const totalStockIn = await Stock.sum("quantity", { where: stockInWhere });

    // Total stock out (filtered)
    const stockOutWhere = { ...where, type: "out" };
    const totalStockOut = await Stock.sum("quantity", { where: stockOutWhere });

    let currentBalance = 0;
    const isGlobalScope =
      !req.query.user &&
      (!req.query.location || req.query.location === "All Locations") &&
      (!req.query.type || req.query.type === "All Transactions") &&
      !req.query.startDate;

    if (isGlobalScope) {
      // Use actual inventory count from Products table
      const productBalanceWhere = {};
      if (req.query.product) {
        productBalanceWhere._id = req.query.product;
      }
      if (req.query.search && where.product_id && where.product_id[Op.in]) {
        productBalanceWhere._id = { [Op.in]: where.product_id[Op.in] };
      }
      currentBalance = await Product.sum("stock", {
        where: productBalanceWhere,
      });
      currentBalance = currentBalance || 0;
    } else {
      currentBalance = (totalStockIn || 0) - (totalStockOut || 0);
    }

    const productWhere = { stock: { [Op.lt]: 10 } };
    if (req.query.product) {
      productWhere._id = req.query.product;
    }
    const lowStockItems = await Product.count({ where: productWhere });

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

// Update a stock transaction
exports.update = async (req, res) => {
  const t = await Stock.sequelize.transaction();
  try {
    const { id } = req.params;
    const { product_id, quantity, type, batch_number, reason, location, note } =
      req.body;

    const stock = await Stock.findByPk(id, { transaction: t });
    if (!stock) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, error: "Stock record not found" });
    }

    const product = await Product.findByPk(stock.product_id, {
      transaction: t,
    });
    if (!product) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, error: "Associated product not found" });
    }

    const targetProductId = product_id || stock.product_id;
    const targetType = type || stock.type;
    const targetQuantity =
      quantity !== undefined ? Number(quantity) : Number(stock.quantity);

    if (targetProductId !== stock.product_id) {
    }

    // 1. Revert OLD
    if (stock.type === "in") {
      product.stock -= Number(stock.quantity);
    } else if (stock.type === "out") {
      product.stock += Number(stock.quantity);
    }

    // If product changed (rare case but handled)
    if (product_id && product_id !== stock.product_id) {
      await product.save({ transaction: t });
      const newProduct = await Product.findByPk(product_id, { transaction: t });
      if (!newProduct) {
        await t.rollback();
        return res
          .status(404)
          .json({ success: false, error: "New product not found" });
      }

      if (targetType === "in") {
        newProduct.stock += targetQuantity;
      } else {
        // Check stock
        if (newProduct.stock < targetQuantity) {
          await t.rollback();
          return res
            .status(400)
            .json({ success: false, error: "Not enough stock" });
        }
        newProduct.stock -= targetQuantity;
      }
      await newProduct.save({ transaction: t });
      stock.balance = newProduct.stock; // Snapshot balance
    } else {
      // Same Product
      if (targetType === "in") {
        product.stock += targetQuantity;
      } else {
        if (product.stock < targetQuantity) {
          await t.rollback();
          return res
            .status(400)
            .json({ success: false, error: "Not enough stock" });
        }
        product.stock -= targetQuantity;
      }
      await product.save({ transaction: t });
      stock.balance = product.stock;
    }

    stock.product_id = targetProductId;
    stock.quantity = targetQuantity;
    stock.type = targetType;
    stock.batch_number = batch_number || stock.batch_number;
    stock.reason = reason || stock.reason;
    stock.location = location || stock.location;
    stock.note = note || stock.note;
    // stock.balance updated above

    await stock.save({ transaction: t });
    await t.commit();

    res.json({ success: true, data: stock });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete a stock transaction
exports.delete = async (req, res) => {
  const t = await Stock.sequelize.transaction();
  try {
    const { id } = req.params;
    const stock = await Stock.findByPk(id, { transaction: t });
    if (!stock) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, error: "Stock record not found" });
    }

    const product = await Product.findByPk(stock.product_id, {
      transaction: t,
    });

    // If product exists, revert the stock change
    if (product) {
      if (stock.type === "in") {
        product.stock -= Number(stock.quantity);
      } else if (stock.type === "out") {
        product.stock += Number(stock.quantity);
      }
      await product.save({ transaction: t });
    }

    await stock.destroy({ transaction: t });
    await t.commit();
    res.json({ success: true, message: "Stock record deleted" });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ success: false, error: err.message });
  }
};
