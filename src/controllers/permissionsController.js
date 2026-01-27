
const User = require("../models/User");

// Get all unique roles (permissions) with pagination
exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const roles = await User.findAll({
      attributes: ["role"],
      group: ["role"],
      limit,
      offset,
      order: [["role", "ASC"]],
    });
    const totalItems = roles.length;
    const totalPages = Math.ceil(totalItems / limit);
    res.json({
      success: true,
      data: roles,
      pagination: { page, limit, totalItems, totalPages },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all users with a specific role
exports.getOne = async (req, res) => {
  const role = req.params.role;
  const users = await User.findAll({ where: { role } });
  if (!users.length) return res.status(404).json({ error: "No users with this role" });
  res.json({ success: true, data: users });
};

// Assign a role to a user
exports.create = async (req, res) => {
  const { _id, role } = req.body;
  try {
    const user = await User.findByPk(_id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.role = role;
    await user.save();
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a user's role
exports.update = async (req, res) => {
  const { _id } = req.params;
  const { role } = req.body;
  try {
    const user = await User.findByPk(_id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.role = role;
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Remove a user's role (set to default 'user')
exports.remove = async (req, res) => {
  const { _id } = req.params;
  try {
    const user = await User.findByPk(_id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.role = "user";
    await user.save();
    res.json({ message: "Role removed, set to 'user'" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
