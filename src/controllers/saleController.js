const { sequelize } = require("../models");
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Stock = require("../models/Stock");

// Get all sales
exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const totalItems = await Sale.count();
    const totalPages = Math.ceil(totalItems / limit);
    // Ensure associations are loaded
    require("../models/associations");
    
    const sales = await Sale.findAll({
      include: [
        { model: Product, as: "product" },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
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
    include: [{ model: Product, as: "product" }],
  });
  if (!sale) return res.status(404).json({ error: "Not found" });
  res.json({ success: true, data: sale });
};

// Create a sale
exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { items, customer_id, payment_method, notes } = req.body;

    // Support both single object (legacy) and items array
    const salesItems = items && Array.isArray(items) ? items : [req.body];
    const createdSales = [];

    for (const item of salesItems) {
      const productId = item.product_id || item.product; // Handle both key names
      const quantity = Number(item.quantity);

      if (!productId || !quantity) continue;

      // 1. Get Product to check stock
      const product = await Product.findByPk(productId, { transaction: t });
      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }

      if (product.stock < quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      // 2. Decrement Product Stock
      const newStock = product.stock - quantity;
      await product.update({ stock: newStock }, { transaction: t });

      // 3. Create Sale Record
      // Note: Sale model currently might strictly define fields.
      // We pass what we can.
      const sale = await Sale.create(
        {
          product_id: productId,
          quantity: quantity,
          // Assuming we might want to store more info if model allows,
          // but for now strictly following the schema we have + logic requirements.
          status: "completed",
          completed_at: new Date(),
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
          location: "Storefront", // Defaulting to Storefront for sales
          note: `Sale #${sale._id} - ${notes || "Direct Sale"}`,
          completed_at: new Date(),
        },
        { transaction: t },
      );

      createdSales.push(sale);
    }

    await t.commit();
    res.status(201).json({ success: true, data: createdSales });
  } catch (err) {
    await t.rollback();
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update a sale
exports.update = async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id);
    if (!sale)
      return res.status(404).json({ success: false, error: "Not found" });
    await sale.update(req.body);
    res.json({ success: true, data: sale });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.remove = async (req, res) => {
  const sale = await Sale.findByPk(req.params.id);
  if (!sale) return res.status(404).json({ error: "Not found" });
  await sale.destroy();
  res.json({ message: "Deleted" });
};
