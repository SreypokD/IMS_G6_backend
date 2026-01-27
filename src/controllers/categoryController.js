const Category = require("../models/Category");

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const totalItems = await Category.count();
    const totalPages = Math.ceil(totalItems / limit);
    const categories = await Category.findAll({
      limit,
      offset,
      order: [["_id", "ASC"]],
    });
    res.json({
      success: true,
      data: categories,
      pagination: { page, limit, totalItems, totalPages },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.create = async (req, res) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: "Not found" });
    await category.update(req.body);
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ error: "Not found" });
  await category.destroy();
  res.json({ message: "Deleted" });
};
