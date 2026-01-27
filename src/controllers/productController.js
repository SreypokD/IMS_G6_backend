const Product = require("../models/Product");
const Category = require("../models/Category");
const Supplier = require("../models/Supplier");

exports.getAll = async (req, res) => {
  try {
    // Parse pagination params
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const totalItems = await Product.count();
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated products
    const products = await Product.findAll({
      include: [Category, Supplier],
      limit,
      offset,
      order: [["_id", "ASC"]],
    });

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getOne = async (req, res) => {
  const product = await Product.findByPk(req.params.id, {
    include: [Category, Supplier],
  });
  if (!product) return res.status(404).json({ error: "Not found" });
  res.json({ success: true, data: product });
};

exports.create = async (req, res) => {
  const { validationResult } = require("express-validator");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Not found" });
    await product.update(req.body);
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ error: "Not found" });
  await product.destroy();
  res.json({ message: "Deleted" });
};
