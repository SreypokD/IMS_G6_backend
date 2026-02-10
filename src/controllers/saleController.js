const { sequelize } = require("../models");
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Stock = require("../models/Stock");
const User = require("../models/User");
const { Op } = require("sequelize");

// Get all sales
exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const { startDate, endDate, customer, status, search } = req.query;
    const where = {};

    if (status && status !== "All Status") where.status = status;
    if (customer && customer !== "All Customers") where.customer_id = customer;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.completed_at = {
        [Op.between]: [start, end],
      };
    }

    // Optional: Add simple search by ID or Note
    if (search) {
      where[Op.or] = [
        { _id: { [Op.like]: `%${search}%` } },
        { notes: { [Op.like]: `%${search}%` } },
      ];
    }

    const totalItems = await Sale.count({ where });
    const totalPages = Math.ceil(totalItems / limit);

    const sales = await Sale.findAll({
      where,
      include: [
        {
          model: require("../models/SaleItem"),
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
        { model: User, as: "customer" },
      ],
      limit,
      offset,
      order: [["completed_at", "DESC"]],
    });
    res.json({
      success: true,
      data: sales,
      pagination: { page, limit, totalItems, totalPages },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get a single sales
exports.getOne = async (req, res) => {
  const sale = await Sale.findByPk(req.params.id, {
    include: [
      {
        model: require("../models/SaleItem"),
        as: "items",
        include: [{ model: Product, as: "product" }],
      },
      { model: User, as: "customer" },
    ],
  });
  if (!sale) return res.status(404).json({ error: "Not found" });
  res.json({ success: true, data: sale });
};

// Create a sale
exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { items, customer_id, payment_method, notes } = req.body;

    // Normalize items
    const salesItems = items && Array.isArray(items) ? items : [req.body];

    if (!salesItems || salesItems.length === 0) {
      throw new Error("No items provided");
    }

    // 1. Create Sale Header
    const sale = await Sale.create(
      {
        customer_id: customer_id || null,
        payment_method: payment_method || "Cash",
        notes: notes || "",
        status: "Completed",
        completed_at: new Date(),
      },
      { transaction: t },
    );

    for (const item of salesItems) {
      const productId = item.product_id || item.product;
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const discount = Number(item.discount) || 0;
      // cost_price will be fetched from product

      if (!productId || quantity <= 0) continue;

      // 2. Check and Update Product Stock
      const product = await Product.findByPk(productId, { transaction: t });
      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }
      if (product.stock < quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      const newStock = product.stock - quantity;
      await product.update({ stock: newStock }, { transaction: t });

      // 3. Create SaleItem
      await require("../models/SaleItem").create(
        {
          sale_id: sale._id,
          product_id: productId,
          quantity: quantity,
          price: price,
          discount: discount,
          cost_price: product.cost_price, // Snapshot cost at time of sale
        },
        { transaction: t },
      );

      // 4. Create Stock Out Record
      await Stock.create(
        {
          product_id: productId,
          user_id: req.user ? req.user._id : null,
          type: "out",
          quantity: quantity,
          balance: newStock,
          location: "Storefront",
          note: `Sale #${sale._id} - ${notes || "Direct Sale"}`,
          completed_at: new Date(),
        },
        { transaction: t },
      );
    }

    await t.commit();
    res.status(201).json({ success: true, data: sale });
  } catch (err) {
    await t.rollback();
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update a sale
exports.update = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const sale = await Sale.findByPk(req.params.id, {
      include: [{ model: require("../models/SaleItem"), as: "items" }],
      transaction: t,
    });

    if (!sale) {
      await t.rollback();
      return res.status(404).json({ success: false, error: "Not found" });
    }

    const { items, customer_id, payment_method, notes, status } = req.body;

    // 1. Revert Stock for existing items
    if (sale.items && sale.items.length > 0) {
      for (const item of sale.items) {
        const product = await Product.findByPk(item.product_id, {
          transaction: t,
        });
        if (product) {
          await product.update(
            { stock: product.stock + item.quantity },
            { transaction: t },
          );

          // Log Stock In (Revert) - Optional but good for tracking
          await Stock.create(
            {
              product_id: item.product_id,
              user_id: req.user ? req.user._id : null,
              type: "in",
              quantity: item.quantity,
              balance: product.stock + item.quantity, // Balance after revert
              location: "Storefront",
              note: `Sale #${sale._id} Updated (Revert)`,
              completed_at: new Date(),
            },
            { transaction: t },
          );
        }
        await item.destroy({ transaction: t });
      }
    }

    // 2. Normalize and Create New Items
    const salesItems = items && Array.isArray(items) ? items : [];

    if (items) {
      // Only update items if 'items' field is present
      for (const item of salesItems) {
        const productId = item.product_id || item.product;
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        const discount = Number(item.discount) || 0;
        // cost_price fetched from product

        if (!productId || quantity <= 0) continue;

        const product = await Product.findByPk(productId, { transaction: t });
        if (!product) throw new Error(`Product not found: ${productId}`);
        if (product.stock < quantity)
          throw new Error(`Insufficient stock for product: ${product.name}`);

        const newStock = product.stock - quantity;
        await product.update({ stock: newStock }, { transaction: t });

        await require("../models/SaleItem").create(
          {
            sale_id: sale._id,
            product_id: productId,
            quantity,
            price,
            discount,
            cost_price: product.cost_price, // Snapshot cost
          },
          { transaction: t },
        );

        // Log Stock Out
        await Stock.create(
          {
            product_id: productId,
            user_id: req.user ? req.user._id : null,
            type: "out",
            quantity: quantity,
            balance: newStock,
            location: "Storefront",
            note: `Sale #${sale._id} Updated`,
            completed_at: new Date(),
          },
          { transaction: t },
        );
      }
    }

    // 3. Update Sale Header
    await sale.update(
      {
        customer_id: customer_id || sale.customer_id,
        payment_method: payment_method || sale.payment_method,
        notes: notes !== undefined ? notes : sale.notes,
        status: status || sale.status,
      },
      { transaction: t },
    );

    await t.commit();

    // Fetch updated sale with items to return
    const updatedSale = await Sale.findByPk(req.params.id, {
      include: [
        {
          model: require("../models/SaleItem"),
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
        { model: User, as: "customer" },
      ],
    });

    res.json({ success: true, data: updatedSale });
  } catch (err) {
    await t.rollback();
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.remove = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const sale = await Sale.findByPk(req.params.id, {
      include: [{ model: require("../models/SaleItem"), as: "items" }],
      transaction: t,
    });

    if (!sale) {
      await t.rollback();
      return res.status(404).json({ error: "Not found" });
    }

    // Revert Stock
    if (sale.items && sale.items.length > 0) {
      for (const item of sale.items) {
        const product = await Product.findByPk(item.product_id, {
          transaction: t,
        });
        if (product) {
          await product.update(
            { stock: product.stock + item.quantity },
            { transaction: t },
          );

          await Stock.create(
            {
              product_id: item.product_id,
              user_id: req.user ? req.user._id : null,
              type: "in",
              quantity: item.quantity,
              balance: product.stock + item.quantity,
              location: "Storefront",
              note: `Sale #${sale._id} Deleted (Revert)`,
              completed_at: new Date(),
            },
            { transaction: t },
          );
        }
        await item.destroy({ transaction: t });
      }
    }

    await sale.destroy({ transaction: t });
    await t.commit();
    res.json({ message: "Deleted" });
  } catch (err) {
    await t.rollback();
    res.status(400).json({ error: err.message });
  }
};
