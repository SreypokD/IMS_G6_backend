const Permission = require("../models/Permission");
const { Op } = require("sequelize");

// Get all permissions
exports.getAll = async (req, res) => {
  try {
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    if (limit === -1) {
      limit = 100000;
      page = 1;
    }
    const search = req.query.search || "";
    const offset = (page - 1) * limit;
    const where = {};
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }
    const totalItems = await Permission.count({ where });
    const totalPages = Math.ceil(totalItems / limit);
    const permissions = await Permission.findAll({
      where,
      limit,
      offset,
      order: [["_id", "DESC"]],
    });

    res.json({
      success: true,
      data: permissions,
      pagination: { page, limit, totalItems, totalPages },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get one permission
exports.getOne = async (req, res) => {
  try {
    const permission = await Permission.findByPk(req.params.id);
    if (!permission)
      return res.status(404).json({ error: "Permission not found" });
    res.json({ success: true, data: permission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a permission
exports.create = async (req, res) => {
  try {
    const permission = await Permission.create(req.body);
    res.status(201).json({ success: true, data: permission });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a permission
exports.update = async (req, res) => {
  try {
    const permission = await Permission.findByPk(req.params.id);
    if (!permission)
      return res.status(404).json({ error: "Permission not found" });
    // Ensure permissions is always an array, not a string
    let updateData = { ...req.body };
    // Only process permissions if it exists in the update data
    if (updateData.permissions !== undefined) {
      if (typeof updateData.permissions === "string") {
        try {
          updateData.permissions = JSON.parse(updateData.permissions);
        } catch {
          updateData.permissions = [];
        }
      }
      if (!Array.isArray(updateData.permissions)) {
        updateData.permissions = [];
      }
    }
    await permission.update(updateData);
    res.json({ success: true, data: permission });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a permission
exports.remove = async (req, res) => {
  try {
    const permission = await Permission.findByPk(req.params.id);
    if (!permission) return res.status(404).json({ error: "Not found" });
    await permission.destroy();
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    // Handle foreign key constraint violations (product is referenced by sale_items, stocks, etc.)
    if (err.original && err.original.errno === 1451) {
      return res.status(409).json({
        success: false,
        error:
          "Cannot delete this permission because it is referenced by existing user records.",
      });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};
