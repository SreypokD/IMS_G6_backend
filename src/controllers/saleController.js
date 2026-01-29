const Sale = require("../models/Sale");

// Get all sales
exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const totalItems = await Sale.count();
    const totalPages = Math.ceil(totalItems / limit);
    const sales = await Sale.findAll({
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
    include: [{ model: Permission, as: "permission" }],
  });
  if (!sale) return res.status(404).json({ error: "Not found" });
  res.json({ success: true, data: sale });
};

// Create a sale
exports.create = async (req, res) => {
  try {
    const sale = await Sale.create(req.body);
    res.status(201).json({ success: true, data: sale });
  } catch (err) {
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
