const Permission = require("../models/Permission");
const User = require("../models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const REFRESH_SECRET =
  process.env.REFRESH_SECRET || process.env.JWT_SECRET + "_refresh";
const refreshTokens = new Set(); // In-memory store for demo; use DB/Redis in production

exports.register = async (req, res) => {
  try {
    const { email, password, role, permission_id } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    // Assign permission_id if provided
    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      permission_id,
    });
    // Fetch user with permission (role) object
    const userWithPermission = await User.findByPk(user._id, {
      include: [{ model: Permission, as: "permission" }],
    });
    res.status(201).json({
      success: true,
      data: {
        id: userWithPermission._id,
        email: userWithPermission.email,
        role: userWithPermission.role,
        first_name: userWithPermission.first_name,
        last_name: userWithPermission.last_name,
        permissions: userWithPermission.permission
          ? userWithPermission.permission.permissions
          : [],
        profile: userWithPermission.profile,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Fetch user with permission (role) object
    const user = await User.findOne({
      where: { email },
      include: [{ model: Permission, as: "permission" }],
    });
    if (!user)
      return res
        .status(400)
        .json({ success: false, error: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res
        .status(400)
        .json({ success: false, error: "Invalid credentials" });
    const permissions = user.permission ? user.permission.permissions : [];
    const access_token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        permissions,
        profile: user.profile,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );
    const refresh_token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        permissions,
        profile: user.profile,
      },
      REFRESH_SECRET,
      { expiresIn: "7d" },
    );
    refreshTokens.add(refresh_token);
    res.json({ success: true, data: { access_token, refresh_token } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Stateless logout for JWT
exports.logout = (req, res) => {
  // Remove refresh token if provided
  const { refresh_token } = req.body;
  if (refresh_token) refreshTokens.delete(refresh_token);
  res.json({ success: true, data: { message: "Logged out" } });
};

exports.refresh = (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token || !refreshTokens.has(refresh_token)) {
    return res
      .status(401)
      .json({ success: false, error: "Invalid refresh token" });
  }
  try {
    const payload = jwt.verify(refresh_token, REFRESH_SECRET);
    const permissions = payload.permissions || [];
    const access_token = jwt.sign(
      {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        first_name: payload.first_name,
        last_name: payload.last_name,
        permissions,
        profile: payload.profile,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );
    res.json({ success: true, data: { access_token } });
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, error: "Expired or invalid refresh token" });
  }
};

exports.profile = async (req, res) => {
  try {
    // req.user is set by authenticateToken middleware
    const user = await User.findByPk(req.user.id, {
      attributes: [
        "_id",
        "email",
        "role",
        "first_name",
        "last_name",
        "profile",
        "createdAt",
        "updatedAt",
      ],
      include: [{ model: Permission, as: "permission" }],
    });
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
