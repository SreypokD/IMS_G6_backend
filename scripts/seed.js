require("dotenv").config({ path: "../environments/.env" });
const { sequelize } = require("../src/models");
const {
  User,
  Product,
  Category,
  Supplier,
  Permission,
} = require("../src/models/associations");
const bcrypt = require("bcryptjs");

async function seed() {
  await sequelize.sync({ force: true }); // Drops and recreates tables

  // Seed categories
  const categories = await Category.bulkCreate([
    { name: "Electronics" },
    { name: "Stationery" },
    { name: "Furniture" },
  ]);

  // Seed suppliers
  const suppliers = await Supplier.bulkCreate([
    {
      company_name: "Acme Corp",
      location: "Phnom Penh",
      contact_person: "John Doe",
      contact_position: "Manager",
      contact_email: "acme@example.com",
      contact_phone: "0123456789",
      address: {
        street: "Main St",
        house: "123",
        village: "Central",
        commune: "Boeng Keng Kang",
        district: "Chamkar Mon",
        province: "Phnom Penh",
        country: "Cambodia",
      },
      payment_term: "Net 30",
      status: "Active",
    },
    {
      company_name: "Global Supplies",
      location: "Siem Reap",
      contact_person: "Jane Smith",
      contact_position: "Sales",
      contact_email: "global@example.com",
      contact_phone: "0987654321",
      address: {
        street: "Market Rd",
        house: "456",
        village: "Old Market",
        commune: "Svay Dangkum",
        district: "Siem Reap",
        province: "Siem Reap",
        country: "Cambodia",
      },
      payment_term: "Net 60",
      status: "Active",
    },
  ]);

  // Seed products
  await Product.bulkCreate([
    {
      code: "P001",
      name: "Laptop",
      description: "15-inch laptop",
      quantity: 10,
      price: 1200,
      category: "Electronics",
      CategoryId: categories[0]._id,
      supplier_id: suppliers[0]._id,
    },
    {
      code: "P002",
      name: "Desk Chair",
      description: "Ergonomic chair",
      quantity: 20,
      price: 150,
      category: "Furniture",
      CategoryId: categories[2]._id,
      supplier_id: suppliers[1]._id,
    },
    {
      code: "P003",
      name: "Notebook",
      description: "A4 ruled",
      quantity: 100,
      price: 2,
      category: "Stationery",
      CategoryId: categories[1]._id,
      supplier_id: suppliers[1]._id,
    },
  ]);

  // Seed permissions
  // Admin permission (full access)
  const adminPermission = await Permission.create({
    name: "Admin",
    description: "Manage everything",
    permissions: [
      // Dashboard
      "view_dashboard",

      // Categories
      "view_category",
      "create_category",
      "update_category",
      "delete_category",

      // Products
      "view_product",
      "create_product",
      "update_product",
      "delete_product",

      // Suppliers
      "view_supplier",
      "create_supplier",
      "update_supplier",
      "delete_supplier",

      // Stocks
      "view_stock",
      "create_stock",
      "update_stock",
      "delete_stock",

      // Order Requests (Purchase)
      "view_order_request",
      "create_order_request",
      "update_order_request",
      "delete_order_request",
      "post_order_request",

      // Approvals
      "view_approve_request",
      "update_approve_request",

      // Confirm Delivery
      "view_confirm_delivery",
      "update_confirm_delivery",

      // Sales
      "view_sale",
      "create_sale",
      "update_sale",
      "delete_sale",

      // Order History
      "view_order_history",

      // Reports & Logs
      "view_report",
      "view_inventory_summary",
      "view_order_stats",
      "view_activity_log",

      // Users
      "view_user",
      "create_user",
      "update_user",
      "delete_user",

      // Permissions
      "view_permission",
      "create_permission",
      "update_permission",
      "delete_permission",
    ],
  });

  // Staff permission (limited access)
  const staffPermission = await Permission.create({
    name: "Staff",
    description: "Limited access",
    permissions: [
      // Dashboard
      "view_dashboard",

      // Master Data (read-only)
      "view_category",
      "view_product",
      "view_supplier",

      // Stock (read-only)
      "view_stock",

      // Purchasing
      "view_order_request",
      "create_order_request",
      "update_order_request",
      "delete_order_request",
      "post_order_request",

      // Sales
      "view_sale",
      "create_sale",
      "update_sale",
      "delete_sale",

      // History & Reports
      "view_order_history",
      "view_report",

      // Logs
      "view_activity_log",
    ],
  });

  // Customer permission (minimal access)
  const customerPermission = await Permission.create({
    name: "Customer",
    description: "Customer access",
    permissions: [
      // Dashboard
      "view_dashboard",

      // Master Data (read-only)
      "view_product",
      "view_category",
      "view_supplier",

      // Purchasing
      "view_order_request",
      "create_order_request",

      // History
      "view_order_history",
    ],
  });

  // Seed users
  const password = await bcrypt.hash("admin123", 10);

  // Seed admin user
  await User.create({
    email: "admin@example.com",
    password,
    role: "admin",
    first_name: "Admin",
    last_name: "User",
    phone: "0123456789",
    address: {
      street: "Main Street",
      house: "123",
      village: "Old Market Area",
      commune: "Boeng Keng Kang",
      district: "Chamkar Mon",
      province: "Phnom Penh",
      country: "Cambodia",
    },
    profile: null,
    permission_id: adminPermission._id,
  });

  // Seed staff user
  await User.create({
    email: "staff@example.com",
    password,
    role: "staff",
    first_name: "Staff",
    last_name: "User",
    phone: "0987654321",
    address: {
      street: "Main Street",
      house: "123",
      village: "Old Market Area",
      commune: "Boeng Keng Kang",
      district: "Chamkar Mon",
      province: "Phnom Penh",
      country: "Cambodia",
    },
    profile: null,
    permission_id: staffPermission._id,
  });

  // Seed customer user
  const customerPassword = await bcrypt.hash("customer123", 10);
  await User.create({
    email: "customer@example.com",
    password: customerPassword,
    role: "customer",
    first_name: "Customer",
    last_name: "User",
    phone: "011223344",
    address: {
      street: "Customer Street",
      house: "789",
      village: "Customer Village",
      commune: "Customer Commune",
      district: "Customer District",
      province: "Phnom Penh",
      country: "Cambodia",
    },
    profile: null,
    permission_id: customerPermission._id,
  });

  console.log("Database seeded!");
  process.exit();
}

seed();
