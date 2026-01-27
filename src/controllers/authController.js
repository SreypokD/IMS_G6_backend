// Stateless logout for JWT
exports.logout = (req, res) => {
  // Remove refresh token if provided
  const { refresh_token } = req.body;
  if (refresh_token) refreshTokens.delete(refresh_token);
  res.json({ success: true, data: { message: "Logged out" } });
};
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const REFRESH_SECRET =
  process.env.REFRESH_SECRET || process.env.JWT_SECRET + "_refresh";
const refreshTokens = new Set(); // In-memory store for demo; use DB/Redis in production

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, role });
    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        permissions: user.permissions,
        profile: user.profile,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res
        .status(400)
        .json({ success: false, error: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res
        .status(400)
        .json({ success: false, error: "Invalid credentials" });
    const access_token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        permissions: user.permissions,
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
        name: user.name,
        permissions: user.permissions,
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

exports.refresh = (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token || !refreshTokens.has(refresh_token)) {
    return res
      .status(401)
      .json({ success: false, error: "Invalid refresh token" });
  }
  try {
    const payload = jwt.verify(refresh_token, REFRESH_SECRET);
    const access_token = jwt.sign(
      {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        name: payload.name,
        permissions: payload.permissions,
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
        "name",
        "permissions",
        "profile",
        "createdAt",
        "updatedAt",
      ],
    });
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
