const Supplier = require("../models/Supplier");

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const totalItems = await Supplier.count();
    const totalPages = Math.ceil(totalItems / limit);
    const Product = require("../models/Product");
    const suppliers = await Supplier.findAll({
      limit,
      offset,
      order: [["_id", "ASC"]],
      include: [
        {
          model: Product,
          attributes: [], // don't include product details, just count
        },
      ],
    });

    // For each supplier, count products
    const suppliersWithCount = await Promise.all(
      suppliers.map(async (supplier) => {
        const count = await supplier.countProducts();
        return {
          ...supplier.toJSON(),
          products_count: count,
        };
      })
    );

    res.json({
      success: true,
      data: suppliersWithCount,
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
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, data: supplier });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ error: "Not found" });
    await supplier.update(req.body);
    res.json({ success: true, data: supplier });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  const supplier = await Supplier.findByPk(req.params.id);
  if (!supplier) return res.status(404).json({ error: "Not found" });
  await supplier.destroy();
  res.json({ message: "Deleted" });
};
