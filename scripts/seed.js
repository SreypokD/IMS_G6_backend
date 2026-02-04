require("dotenv").config({ path: "../environments/.env" });
const { sequelize } = require("../src/models");
const {
  User,
  Product,
  Category,
  Supplier,
  Permission,
  OrderRequest,
  OrderRequestItem,
  Notification,
  ActivityLog,
} = require("../src/models/associations");
const bcrypt = require("bcryptjs");

async function seed() {
  // Disable foreign key checks, drop and recreate all tables
  await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
  await sequelize.sync({ force: true }); // Drops and recreates tables
  await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");

  // Seed categories
  const categories = await Category.bulkCreate([
    { name: "Electronics", description: "Electronic devices and gadgets" },
    { name: "Stationery", description: "Office and school supplies" },
    { name: "Furniture", description: "Home and office furniture" },
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

  // Seed permissions FIRST
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
      // Order History
      "view_order_history",
      // Reports & Logs
      "view_report",
      "view_inventory_summary",
      "view_order_stats",
      "view_activity_log",
    ],
  });

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

  // Now seed users
  const password = await bcrypt.hash("admin123", 10);
  const adminUserRecord = await User.create({
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

  const staffUserRecord = await User.create({
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

  const customerPassword = await bcrypt.hash("customer123", 10);
  const customerUserRecord = await User.create({
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

  // Now seed products
  const products = await Product.bulkCreate([
    {
      code: "P001",
      name: "Laptop",
      description: "15-inch laptop",
      price: 1200,
      stock: 10,
      category_id: categories[0]._id,
      supplier_id: suppliers[0]._id,
    },
    {
      code: "P002",
      name: "Desk Chair",
      description: "Ergonomic chair",
      price: 150,
      stock: 20,
      category_id: categories[2]._id,
      supplier_id: suppliers[1]._id,
    },
    {
      code: "P003",
      name: "Notebook",
      description: "A4 ruled",
      price: 2,
      stock: 100,
      category_id: categories[1]._id,
      supplier_id: suppliers[1]._id,
    },
    {
      code: "P004",
      name: "Monitor",
      description: "24-inch LED monitor",
      price: 250,
      stock: 15,
      category_id: categories[0]._id,
      supplier_id: suppliers[0]._id,
    },
  ]);

  // Use the created user records for demo data
  const adminUser = adminUserRecord;
  const staffUser = staffUserRecord;
  const customerUser = customerUserRecord;

  const orderRequests = await Promise.all([
    // Pending order by customer
    OrderRequest.create({
      quantity: 2,
      status: "pending",
      requested_date: new Date(),
      notes: "Need urgently",
      customer_remark: "Please deliver ASAP",
      delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      updated_by: customerUser._id,
      admin_remarks: "Please deliver ASAP",
      rejection_reason: null,
      notified: false,
      approved_by: null,
      approved_date: null,
      admin_remark: "Please deliver ASAP",
      requester_id: customerUser._id,
      product_id: products[0]._id,
      supplier_id: products[0].supplier_id,
    }),
    // Approved order by staff
    OrderRequest.create({
      quantity: 5,
      status: "approved",
      requested_date: new Date(),
      notes: "For new staff",
      customer_remark: "",
      delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      updated_by: staffUser._id,
      admin_remarks: "Approved for purchase",
      rejection_reason: null,
      notified: true,
      approved_by: adminUser._id,
      approved_date: new Date(),
      admin_remark: "Please deliver ASAP",
      requester_id: staffUser._id,
      product_id: products[1]._id,
      supplier_id: products[1].supplier_id,
    }),
    // Rejected order by customer
    OrderRequest.create({
      quantity: 1,
      status: "rejected",
      requested_date: new Date(),
      notes: "Need urgently, my cat is hungry",
      customer_remark: "",
      delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      updated_by: adminUser._id,
      admin_remarks: "Please deliver ASAP",
      rejection_reason: "Out of stock",
      notified: true,
      approved_by: null,
      approved_date: null,
      admin_remark: "Please deliver ASAP",
      requester_id: customerUser._id,
      product_id: products[2]._id,
      supplier_id: products[2].supplier_id,
    }),
  ]);

  // Seed OrderRequestItems for each order
  await Promise.all([
    OrderRequestItem.create({
      order_request_id: orderRequests[0]._id,
      product_id: products[0]._id,
      quantity: 2,
    }),
    OrderRequestItem.create({
      order_request_id: orderRequests[1]._id,
      product_id: products[1]._id,
      quantity: 5,
    }),
    OrderRequestItem.create({
      order_request_id: orderRequests[2]._id,
      product_id: products[2]._id,
      quantity: 1,
    }),
  ]);

  await Promise.all([
    Notification.create({
      user_id: adminUser._id,
      type: "order_request",
      message: "New order request submitted by customer.",
      entity_type: "Order Request",
      entity_id: orderRequests[0]._id,
      read: false,
    }),
    Notification.create({
      user_id: staffUser._id,
      type: "order_approved",
      message: "Order request approved by admin.",
      entity_type: "Order Request",
      entity_id: orderRequests[1]._id,
      read: false,
    }),
    Notification.create({
      user_id: customerUser._id,
      type: "order_rejected",
      message: "Order request rejected by admin.",
      entity_type: "Order Request",
      entity_id: orderRequests[2]._id,
      read: false,
    }),
  ]);

  // Seed ActivityLogs
  await Promise.all([
    ActivityLog.create({
      user_id: customerUser._id,
      action: "create_order_request",
      details: "Customer submitted a new order request for Laptop.",
      entity_type: "Order Request",
      entity_id: orderRequests[0]._id,
    }),
    ActivityLog.create({
      user_id: adminUser._id,
      action: "approve_order_request",
      details: "Admin approved order request for Desk Chair.",
      entity_type: "Order Request",
      entity_id: orderRequests[1]._id,
    }),
    ActivityLog.create({
      user_id: adminUser._id,
      action: "reject_order_request",
      details: "Admin rejected order request for Notebook.",
      entity_type: "Order Request",
      entity_id: orderRequests[2]._id,
    }),
  ]);

  console.log("Database seeded!");
  process.exit();
}

seed();
