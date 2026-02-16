const Permission = require("../models/Permission");
const User = require("../models/User");
const { Op } = require("sequelize");
const { sendMail } = require("../utils/mail.util");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const REFRESH_SECRET =
  process.env.REFRESH_SECRET || process.env.JWT_SECRET + "_refresh";
const refreshTokens = new Set(); // In-memory store for demo; use DB/Redis in production

exports.register = async (req, res) => {
  try {
    let {
      email,
      password,
      first_name,
      last_name,
      phone,
      address,
      customer_type,
      company_name,
      position,
      company_registration_no,
      request_purpose,
      expected_order_volume,
      order_frequency,
      product_categories,
      id_card_or_business_license,
      shop_photo,
      location_photo,
      agree_terms,
      note_from_customer,
    } = req.body;

    // Ensure address is always an object if provided as a JSON string
    if (typeof address === "string") {
      try {
        address = JSON.parse(address);
      } catch (e) {
        address = null;
      }
    }

    // Ensure product_categories is parsed if string
    if (typeof product_categories === "string") {
      try {
        product_categories = JSON.parse(product_categories);
      } catch (e) {
        product_categories = [];
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
      status: "pending", // Default to pending for approval
      customer_type: customer_type || "business",
      company_name,
      position,
      company_registration_no,
      request_purpose,
      expected_order_volume,
      order_frequency,
      product_categories,
      id_card_or_business_license,
      shop_photo,
      location_photo,
      agree_terms,
      note_from_customer,
    });
    // Fetch user with permission (role) object
    const userMapped = await User.findByPk(user._id, {
      include: [{ model: Permission, as: "permission" }],
    });

    // Send email to admins
    try {
      const admins = await User.findAll({ where: { role: "admin" } });
      const adminEmails = admins.map((admin) => admin.email);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      if (adminEmails.length > 0) {
        await sendMail({
          to: adminEmails.join(","),
          subject: "New Partner Registration Request",
          text: `A new partner request has been received from ${first_name} ${last_name} (${company_name || "Business"}).\n\nEmail: ${email}\nPhone: ${phone}\n\nPlease login to the admin panel to review and approve:\n${frontendUrl}/users`,
          html: `<p>A new partner request has been received from <b>${first_name} ${last_name}</b> (${company_name || "Business"}).</p>
                 <p>Email: ${email}</p>
                 <p>Phone: ${phone}</p>
                 <p>Please login to the admin panel to review and approve.</p>
                 <p>
                   <a href="${frontendUrl}/users" style="display: inline-block; padding: 10px 20px; background-color: #1e3a5f; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Review Request</a>
                 </p>`,
        });
      }
    } catch (emailErr) {
      console.error("Failed to send admin notification email:", emailErr);
    }
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
        status: userMapped.status,
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
    // Allow login with email, phone, or username
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email }, { phone: email }, { username: email }],
      },
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

    if (user.status === "pending") {
      return res.status(403).json({
        success: false,
        error:
          "Your account is pending approval. Please wait for admin confirmation.",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        error: "Your account is inactive. Please contact administrator.",
      });
    }

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
        "phone",
        "address",
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

    res.json({
      success: true,
      data: { ...user.toJSON(), address: address || {} },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
