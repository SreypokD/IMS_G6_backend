const User = require("../models/User");
const Permission = require("../models/Permission");

// Get all users
exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const totalItems = await User.count();
    const totalPages = Math.ceil(totalItems / limit);
    const users = await User.findAll({
      limit,
      offset,
      order: [["_id", "DESC"]],
    });
    res.json({
      success: true,
      data: users,
      pagination: { page, limit, totalItems, totalPages },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get a single user
exports.getOne = async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    include: [{ model: Permission, as: "permission" }],
  });
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json({ success: true, data: user });
};

// Create a user
exports.create = async (req, res) => {
  const { validationResult } = require("express-validator");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  try {
    const bcrypt = require("bcryptjs");
    const data = { ...req.body };
    // Sanitize address if present and is object
    if (
      data.address &&
      typeof data.address === "object" &&
      !Array.isArray(data.address)
    ) {
      data.address = {
        street: data.address.street || "",
        house: data.address.house || "",
        village: data.address.village || "",
        commune: data.address.commune || "",
        district: data.address.district || "",
        province: data.address.province || "",
        country: data.address.country || "",
      };
    }
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    // Check if email already exists
    const existing = await User.findOne({ where: { email: data.email } });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, error: "Email already exists" });
    }
    const user = await User.create(data);
    // Fetch user with full permission objects
    const userWithPermissions = await User.findByPk(user._id, {
      include: [{ model: Permission, as: "permission" }],
    });
    res.status(201).json({ success: true, data: userWithPermissions });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a user
exports.update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "Not found" });
    // Only allow updating specific fields
    const allowedFields = [
      "email",
      "password",
      "role",
      "first_name",
      "last_name",
      "phone",
      "address",
      "profile",
    ];
    const updateData = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        if (
          key === "address" &&
          typeof req.body.address === "object" &&
          !Array.isArray(req.body.address)
        ) {
          updateData.address = {
            street: req.body.address.street || "",
            house: req.body.address.house || "",
            village: req.body.address.village || "",
            commune: req.body.address.commune || "",
            district: req.body.address.district || "",
            province: req.body.address.province || "",
            country: req.body.address.country || "",
          };
        } else {
          updateData[key] = req.body[key];
        }
      }
    }
    await user.update(updateData);
    // Fetch user with full permission objects
    const userWithPermissions = await User.findByPk(user._id, {
      include: [{ model: Permission, as: "permission" }],
    });
    res.json({ success: true, data: userWithPermissions });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a user
exports.remove = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  await user.destroy();
  res.json({ message: "Deleted" });
};
