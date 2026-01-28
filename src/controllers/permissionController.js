const Permission = require("../models/Permission");

// Get all permissions
exports.getAll = async (req, res) => {
  try {
    // Parse pagination params
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const totalItems = await Permission.count();
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated permissions
    const permissions = await Permission.findAll({
      limit,
      offset,
      order: [["_id", "ASC"]],
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
    await permission.update(req.body);
    res.json({ success: true, data: permission });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a permission
exports.remove = async (req, res) => {
  try {
    const permission = await Permission.findByPk(req.params.id);
    if (!permission)
      return res.status(404).json({ error: "Permission not found" });
    await permission.destroy();
    res.json({ success: true, message: "Permission deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
