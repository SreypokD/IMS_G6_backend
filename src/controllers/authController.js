const Permission = require("../models/Permission");
const User = require("../models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const REFRESH_SECRET =
  process.env.REFRESH_SECRET || process.env.JWT_SECRET + "_refresh";
const refreshTokens = new Set(); // In-memory store for demo; use DB/Redis in production

exports.register = async (req, res) => {
  try {
    let { email, password, first_name, last_name, phone, address } = req.body;
    // Ensure address is always an object if provided as a JSON string
    if (typeof address === "string") {
      try {
        address = JSON.parse(address);
      } catch (e) {
        address = null;
      }
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // Always assign 'customer' role and customer permissions
    // Find or create the 'customer' permission
    let customerPermission = await Permission.findOne({
      where: { name: "customer" },
    });
    if (!customerPermission) {
      customerPermission = await Permission.create({
        name: "customer",
        description: "Customer role permissions",
        permissions: [
          "view_dashboard",
          "view_product",
          "view_category",
          "view_supplier",
          "view_order_request",
          "create_order_request",
          "view_order_history",
        ],
      });
    }
    const user = await User.create({
      first_name,
      last_name,
      email,
      phone,
      address: address && typeof address === "object" ? address : null,
      password: hashedPassword,
      role: "customer",
      permission_id: customerPermission._id,
    });
    // Fetch user with permission (role) object
    const userMapped = await User.findByPk(user._id, {
      include: [{ model: Permission, as: "permission" }],
    });
    res.status(201).json({
      success: true,
      data: {
        _id: userMapped._id,
        email: userMapped.email,
        phone: userMapped.phone,
        address: userMapped.address || {},
        role: userMapped.role,
        first_name: userMapped.first_name,
        last_name: userMapped.last_name,
        permission: userMapped.permission,
        profile: userMapped.profile,
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
    const access_token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        permission: user.permission,
        profile: user.profile,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );
    const refresh_token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        permission: user.permission,
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
  if (!refresh_token) {
    return res
      .status(401)
      .json({ success: false, error: "No refresh token provided" });
  }
  try {
    const payload = jwt.verify(refresh_token, REFRESH_SECRET);

    const access_token = jwt.sign(
      {
        _id: payload._id,
        email: payload.email,
        role: payload.role,
        first_name: payload.first_name,
        last_name: payload.last_name,
        permission: payload.permission,
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
    const user = await User.findByPk(req.user._id, {
      attributes: [
        "_id",
        "email",
        "role",
        "first_name",
        "last_name",
        "phone",
        "address",
        "profile",
        "createdAt",
        "updatedAt",
      ],
      include: [{ model: Permission, as: "permission" }],
    });
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });

    let address = user.address;
    if (typeof address === "string") {
      try {
        address = JSON.parse(address);
      } catch (e) {
        address = {};
      }
    }
    
    res.json({ success: true, data: { ...user.toJSON(), address: address || {} } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
