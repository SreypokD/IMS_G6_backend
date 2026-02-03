const Product = require("../models/Product");
const Category = require("../models/Category");
const Supplier = require("../models/Supplier");
const { generateCode } = require("../utils/code.util");
const { Op } = require("sequelize");

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
      include: [
        { model: Category, as: "category" },
        { model: Supplier, as: "supplier" },
      ],
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
    include: [
      { model: Category, as: "category" },
      { model: Supplier, as: "supplier" },
    ],
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
    // Map frontend fields to DB fields
    if (req.body.category) {
      req.body.category_id = req.body.category;
      delete req.body.category;
    }
    if (req.body.supplier) {
      req.body.supplier_id = req.body.supplier;
      delete req.body.supplier;
    }
    // Auto-generate product code if not provided
    if (!req.body.code) {
      // Find the latest product code for this year
      const year = new Date().getFullYear().toString().slice(-2);
      const latest = await Product.findOne({
        where: { code: { [Op.like]: `P${year}%` } },
        order: [["code", "DESC"]],
      });
      let lastNumber = 0;
      if (latest && latest.code) {
        lastNumber = parseInt(latest.code.slice(3)) || 0;
      }
      req.body.code = generateCode(lastNumber, "P");
    }
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    // Map frontend fields to DB fields
    if (req.body.category) {
      req.body.category_id = req.body.category;
      delete req.body.category;
    }
    if (req.body.supplier) {
      req.body.supplier_id = req.body.supplier;
      delete req.body.supplier;
    }
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Not found" });
    await product.update(req.body);
    // Fetch user with full permission objects
    const productWithCategoryAndSupplier = await Product.findByPk(product._id, {
      include: [
        { model: Category, as: "category" },
        { model: Supplier, as: "supplier" },
      ],
    });
    res.json({ success: true, data: productWithCategoryAndSupplier });
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
