require("dotenv").config({ path: "../environments/.env" });
const bcrypt = require("bcryptjs");
const { sequelize } = require("../src/models");
const {
  User,
  Product,
  Stock,
  Category,
  Supplier,
  Permission,
  OrderRequest,
  OrderRequestItem,
  Notification,
  ActivityLog,
  ApproveRequest,
  Sale,
  SaleItem,
  Expense,
} = require("../src/models/associations");

async function seed() {
  // Disable foreign key checks, drop and recreate all tables
  await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
  await sequelize.sync({ force: true }); // Drops and recreates tables
  await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");

  // Seed categories
  const categories = await Category.bulkCreate([
    {
      name: "Electronics",
      description: "Electronic devices and gadgets",
      status: "active",
    },
    {
      name: "Stationery",
      description: "Office and school supplies",
      status: "active",
    },
    {
      name: "Furniture",
      description: "Home and office furniture",
      status: "active",
    },
    {
      name: "Food & Beverage",
      description: "Groceries and drinks",
      status: "active",
    },
    {
      name: "Clothing",
      description: "Apparel and accessories",
      status: "active",
    },
    {
      name: "Health & Beauty",
      description: "Personal care products",
      status: "active",
    },
    {
      name: "Sports & Outdoors",
      description: "Sporting goods and outdoor gear",
      status: "active",
    },
    {
      name: "Automotive",
      description: "Car parts and accessories",
      status: "active",
    },
    {
      name: "Toys & Games",
      description: "Children's toys and games",
      status: "active",
    },
    {
      name: "Books & Media",
      description: "Books, music, and movies",
      status: "active",
    },
    {
      name: "Office Supplies",
      description: "Supplies for office use",
      status: "active",
    },
    {
      name: "Cleaning Supplies",
      description: "Products for cleaning and maintenance",
      status: "active",
    },
    {
      name: "Pet Supplies",
      description: "Products for pets",
      status: "active",
    },
    {
      name: "Garden & Outdoor",
      description: "Gardening tools and outdoor equipment",
      status: "active",
    },
    {
      name: "Baby Products",
      description: "Products for babies and toddlers",
      status: "active",
    },
    {
      name: "Hardware",
      description: "Tools and hardware supplies",
      status: "active",
    },
    {
      name: "Software",
      description: "Computer software and licenses",
      status: "active",
    },
    {
      name: "Music Instruments",
      description: "Instruments and accessories",
      status: "active",
    },
    {
      name: "Art Supplies",
      description: "Materials for artists",
      status: "active",
    },
    {
      name: "Travel & Luggage",
      description: "Travel bags and accessories",
      status: "active",
    },
    {
      name: "Jewelry",
      description: "Fashion jewelry and accessories",
      status: "active",
    },
    {
      name: "Watches",
      description: "Wristwatches and accessories",
      status: "active",
    },
    { name: "Footwear", description: "Shoes and footwear", status: "active" },
    {
      name: "Accessories",
      description: "Fashion accessories",
      status: "active",
    },
    {
      name: "Gadgets",
      description: "Unique gadgets and tech",
      status: "active",
    },
    {
      name: "Collectibles",
      description: "Collectible items and memorabilia",
      status: "active",
    },
    {
      name: "Musical Instruments",
      description: "Instruments and music gear",
      status: "active",
    },
    {
      name: "Industrial Supplies",
      description: "Supplies for industrial use",
      status: "active",
    },
    {
      name: "Medical Supplies",
      description: "Healthcare products and equipment",
      status: "active",
    },
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
      },
      payment_term: "Net 60",
      status: "Active",
    },
    {
      company_name: "Office Essentials",
      location: "Phnom Penh",
      contact_person: "Alice Johnson",
      contact_position: "Procurement",
      contact_email: "office@example.com",
      contact_phone: "011223344",
      address: {
        street: "Business Ave",
        house: "789",
        village: "Tech Park",
        commune: "Chroy Changvar",
        district: "Chroy Changvar",
        province: "Phnom Penh",
      },
      payment_term: "Net 45",
      status: "Active",
    },
    {
      company_name: "Furniture Co",
      location: "Battambang",
      contact_person: "Bob Lee",
      contact_position: "Sales Manager",
      contact_email: "furniture@example.com",
      contact_phone: "022334455",
      address: {
        street: "Furniture St",
        house: "321",
        village: "Market Area",
        commune: "Svay Pak",
        district: "Battambang",
        province: "Battambang",
      },
      payment_term: "Net 30",
      status: "Active",
    },
    {
      company_name: "Tech Gadgets",
      location: "Phnom Penh",
      contact_person: "Charlie Kim",
      contact_position: "Sales Executive",
      contact_email: "techgadgets@example.com",
      contact_phone: "033445566",
      address: {
        street: "Gadget Blvd",
        house: "654",
        village: "Tech Park",
        commune: "Chroy Changvar",
        district: "Chroy Changvar",
        province: "Phnom Penh",
      },
      payment_term: "Net 60",
      status: "Active",
    },
    {
      company_name: "Stationery World",
      location: "Siem Reap",
      contact_person: "Diana Prince",
      contact_position: "Procurement Officer",
      contact_email: "stationery@example.com",
      contact_phone: "044556677",
      address: {
        street: "Stationery Rd",
        house: "987",
        village: "Market Area",
        commune: "Svay Dangkum",
        district: "Siem Reap",
        province: "Siem Reap",
      },
      payment_term: "Net 45",
      status: "Active",
    },
    {
      company_name: "Health & Beauty Inc",
      location: "Phnom Penh",
      contact_person: "Eve Adams",
      contact_position: "Sales Director",
      contact_email: "healthbeauty@example.com",
      contact_phone: "055667788",
      address: {
        street: "Beauty St",
        house: "321",
        village: "Wellness Area",
        commune: "Toul Kork",
        district: "Toul Kork",
        province: "Phnom Penh",
      },
      payment_term: "Net 30",
      status: "Active",
    },
    {
      company_name: "Outdoor Gear Ltd",
      location: "Battambang",
      contact_person: "Frank Miller",
      contact_position: "Sales Manager",
      contact_email: "outdoorgear@example.com",
      contact_phone: "066778899",
      address: {
        street: "Gear St",
        house: "654",
        village: "Adventure Area",
        commune: "Battambang",
        district: "Battambang",
        province: "Battambang",
      },
      payment_term: "Net 60",
      status: "Active",
    },
    {
      company_name: "Automotive Parts Co",
      location: "Phnom Penh",
      contact_person: "Grace Lee",
      contact_position: "Procurement Manager",
      contact_email: "automotiveparts@example.com",
      contact_phone: "077889900",
      address: {
        street: "Auto St",
        house: "987",
        village: "Industrial Area",
        commune: "Chroy Changvar",
        district: "Chroy Changvar",
        province: "Phnom Penh",
      },
      payment_term: "Net 45",
      status: "Active",
    },
    {
      company_name: "Book & Media Co",
      location: "Siem Reap",
      contact_person: "Hannah Brown",
      contact_position: "Sales Executive",
      contact_email: "bookmedia@example.com",
      contact_phone: "088990011",
      address: {
        street: "Book St",
        house: "123",
        village: "Library Area",
        commune: "Svay Dangkum",
        district: "Siem Reap",
        province: "Siem Reap",
      },
      payment_term: "Net 30",
      status: "Active",
    },
    {
      company_name: "Clothing & Accessories",
      location: "Phnom Penh",
      contact_person: "Ian Scott",
      contact_position: "Sales Manager",
      contact_email: "clothingaccessories@example.com",
      contact_phone: "099001122",
      address: {
        street: "Fashion St",
        house: "456",
        village: "Shopping Area",
        commune: "Toul Svay Prey",
        district: "Chamkar Mon",
        province: "Phnom Penh",
      },
      payment_term: "Net 30",
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
      // Expenses
      "view_expense",
      "create_expense",
      "update_expense",
      "delete_expense",
      // Order History
      "view_order_history",
      // Reports & Logs
      "view_order_stats",
      "view_activity_log",
      "view_report",
      "view_inventory_summary",
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
      // Stock (read-only)
      "view_stock",
      "create_stock",
      "update_stock",
      "delete_stock",
      // Purchasing
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
      // Expenses
      "view_expense",
      "create_expense",
      "update_expense",
      "delete_expense",
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
  const adminUser = await User.create({
    _id: "5f8d04f3b54764421b7156c0",
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
    },
    profile: null,
    permission_id: adminPermission._id,
    user_type: "internal",
  });

  const staffUser = await User.create({
    _id: "5f8d04f3b54764421b7156c1",
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
    },
    profile: null,
    permission_id: staffPermission._id,
    user_type: "internal",
  });

  const customerPassword = await bcrypt.hash("customer123", 10);
  const customerUser = await User.create({
    _id: "5f8d04f3b54764421b7156c2",
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
    },
    profile: null,
    permission_id: customerPermission._id,
    user_type: "external",
  });

  // seed products
  const products = await Product.bulkCreate([
    {
      code: "P001",
      name: "Laptop",
      description: "15-inch laptop",
      price: 1200,
      stock: 0,
      category_id: categories[0]._id,
      supplier_id: suppliers[0]._id,
    },
    {
      code: "P002",
      name: "Desk Chair",
      description: "Ergonomic chair",
      price: 150,
      stock: 0,
      category_id: categories[2]._id,
      supplier_id: suppliers[1]._id,
    },
    {
      code: "P003",
      name: "Notebook",
      description: "A4 ruled",
      price: 2,
      stock: 0,
      category_id: categories[1]._id,
      supplier_id: suppliers[1]._id,
    },
    {
      code: "P004",
      name: "Monitor",
      description: "24-inch LED monitor",
      price: 250,
      stock: 0,
      category_id: categories[0]._id,
      supplier_id: suppliers[0]._id,
    },
    {
      code: "P005",
      name: "Pen Set",
      description: "Set of 10 pens",
      price: 5,
      stock: 0,
      category_id: categories[1]._id,
      supplier_id: suppliers[1]._id,
    },
    {
      code: "P006",
      name: "Office Desk",
      description: "Wooden office desk",
      price: 300,
      stock: 0,
      category_id: categories[2]._id,
      supplier_id: suppliers[3]._id,
    },
    {
      code: "P007",
      name: "Smartphone",
      description: "Latest model smartphone",
      price: 800,
      stock: 0,
      category_id: categories[0]._id,
      supplier_id: suppliers[4]._id,
    },
    {
      code: "P008",
      name: "Stapler",
      description: "Standard office stapler",
      price: 10,
      stock: 0,
      category_id: categories[1]._id,
      supplier_id: suppliers[5]._id,
    },
    {
      code: "P009",
      name: "Headphones",
      description: "Noise-cancelling headphones",
      price: 150,
      stock: 0,
      category_id: categories[0]._id,
      supplier_id: suppliers[4]._id,
    },
    {
      code: "P010",
      name: "Whiteboard",
      description: "Magnetic whiteboard",
      price: 100,
      stock: 0,
      category_id: categories[2]._id,
      supplier_id: suppliers[3]._id,
    },
    {
      code: "P011",
      name: "Coffee Maker",
      description: "Automatic coffee maker",
      price: 80,
      stock: 0,
      category_id: categories[3]._id,
      supplier_id: suppliers[6]._id,
    },
    {
      code: "P012",
      name: "Water Bottle",
      description: "Insulated water bottle",
      price: 25,
      stock: 0,
      category_id: categories[3]._id,
      supplier_id: suppliers[6]._id,
    },
    {
      code: "P013",
      name: "Backpack",
      description: "Laptop backpack",
      price: 60,
      stock: 0,
      category_id: categories[4]._id,
      supplier_id: suppliers[7]._id,
    },
    {
      code: "P014",
      name: "Sunglasses",
      description: "Polarized sunglasses",
      price: 120,
      stock: 0,
      category_id: categories[4]._id,
      supplier_id: suppliers[7]._id,
    },
    {
      code: "P015",
      name: "Running Shoes",
      description: "Comfortable running shoes",
      price: 90,
      stock: 0,
      category_id: categories[4]._id,
      supplier_id: suppliers[7]._id,
    },
    {
      code: "P016",
      name: "Shampoo",
      description: "Hair care shampoo",
      price: 15,
      stock: 0,
      category_id: categories[5]._id,
      supplier_id: suppliers[6]._id,
    },
    {
      code: "P017",
      name: "Conditioner",
      description: "Hair care conditioner",
      price: 15,
      stock: 0,
      category_id: categories[5]._id,
      supplier_id: suppliers[6]._id,
    },
    {
      code: "P018",
      name: "T-shirt",
      description: "Cotton t-shirt",
      price: 20,
      stock: 0,
      category_id: categories[4]._id,
      supplier_id: suppliers[7]._id,
    },
    {
      code: "P019",
      name: "Jeans",
      description: "Denim jeans",
      price: 40,
      stock: 0,
      category_id: categories[4]._id,
      supplier_id: suppliers[7]._id,
    },
    {
      code: "P020",
      name: "Jacket",
      description: "Winter jacket",
      price: 100,
      stock: 0,
      category_id: categories[4]._id,
      supplier_id: suppliers[7]._id,
    },
  ]);

  // seed stocks
  const stocks = await Stock.bulkCreate([
    // Laptop (P001) - Stock: 10
    {
      product_id: products[0]._id,
      user_id: adminUser._id,
      batch_number: "B-LAP-001",
      reason: "Purchase",
      type: "in",
      quantity: 12, // Bought 12
      location: "Main Warehouse",
      completed_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      notes: "Initial purchase",
      balance: 12,
    },
    {
      product_id: products[0]._id,
      user_id: staffUser._id,
      batch_number: "B-LAP-001",
      reason: "Sale",
      type: "out",
      quantity: 2, // Sold 2, Remaining: 10 (Matches Product stock)
      location: "Showroom",
      completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      notes: "Customer sale",
      balance: 10,
    },

    // Desk Chair (P002) - Stock: 20
    {
      product_id: products[1]._id,
      user_id: adminUser._id,
      batch_number: "B-CHR-001",
      reason: "Purchase",
      type: "in",
      quantity: 20,
      location: "Main Warehouse",
      completed_at: new Date(),
      notes: "Initial stock",
      balance: 20,
    },

    // Notebook (P003) - Stock: 100
    {
      product_id: products[2]._id,
      user_id: adminUser._id,
      batch_number: "B-NB-001",
      reason: "Purchase",
      type: "in",
      quantity: 100,
      location: "Main Warehouse",
      completed_at: new Date(),
      notes: "Bulk purchase",
      balance: 100,
    },

    // Monitor (P004) - Stock: 15
    {
      product_id: products[3]._id,
      user_id: adminUser._id,
      batch_number: "B-MON-001",
      reason: "Purchase",
      type: "in",
      quantity: 15,
      location: "Main Warehouse",
      completed_at: new Date(),
      notes: "Initial stock",
      balance: 15,
    },

    // Smartphone (P007) - Stock: 25
    {
      product_id: products[6]._id,
      user_id: adminUser._id,
      batch_number: "B-PHN-001",
      reason: "Purchase",
      type: "in",
      quantity: 30,
      location: "Main Warehouse",
      completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      notes: "New shipment",
      balance: 30,
    },
    {
      product_id: products[6]._id,
      user_id: staffUser._id,
      batch_number: "B-PHN-001",
      reason: "Damage",
      type: "out",
      quantity: 5, // Damaged 5, Remaining: 25
      location: "Main Warehouse",
      completed_at: new Date(),
      notes: "Damaged during transport",
      balance: 25,
    },
  ]);

  // Update Product stock levels based on transactions
  for (const stock of stocks) {
    const product = products.find((p) => p._id === stock.product_id);
    if (product) {
      if (stock.type === "in") {
        product.stock += stock.quantity;
      } else {
        product.stock -= stock.quantity;
      }
    }
  }

  // Save updated product stocks
  for (const product of products) {
    if (product.stock !== 0) {
      // Optimize: only update if changed
      await Product.update(
        { stock: product.stock },
        { where: { _id: product._id } },
      );
    }
  }

  // Seed Order Requests with various statuses
  const orderRequests = [];

  // 1. Pending Order (Customer)
  orderRequests.push(
    await OrderRequest.create({
      quantity: 2,
      status: "pending",
      requested_date: new Date(),
      notes: "Need urgently",
      customer_remark: "Please deliver ASAP",
      delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      requester_id: customerUser._id,
      supplier_id: suppliers[0]._id, // Acme Corp
    }),
  );

  // 2. Pending Order (Staff)
  orderRequests.push(
    await OrderRequest.create({
      quantity: 10,
      status: "pending",
      requested_date: new Date(),
      notes: "Office supplies restocking",
      delivery_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      requester_id: staffUser._id,
      supplier_id: suppliers[2]._id, // Office Essentials
    }),
  );

  // 3. Approved Order (Ready for Delivery)
  const approvedOrder = await OrderRequest.create({
    quantity: 5,
    status: "approved",
    requested_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    notes: "For new project",
    delivery_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    requester_id: staffUser._id,
    supplier_id: suppliers[4]._id, // Tech Gadgets
    approved_by: adminUser._id,
    approved_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    notified: true,
  });
  orderRequests.push(approvedOrder);

  // Create associated ApproveRequest
  await ApproveRequest.create({
    order_request_id: approvedOrder._id,
    status: "approved",
    admin_remarks: "Approved, proceed with delivery.",
    approved_by: adminUser._id,
    approved_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  });

  // 4. Rejected Order
  const rejectedOrder = await OrderRequest.create({
    quantity: 1,
    status: "rejected",
    requested_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    notes: "Personal item",
    requester_id: staffUser._id,
    supplier_id: suppliers[6]._id,
    rejection_reason: "Not a valid business expense",
    notified: true,
  });
  orderRequests.push(rejectedOrder);

  // Create associated ApproveRequest (Rejected)
  await ApproveRequest.create({
    order_request_id: rejectedOrder._id,
    status: "rejected",
    rejection_reason: "Not a valid business expense",
    admin_remarks: "Policy violation",
    approved_by: adminUser._id,
    approved_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  });

  // 5. Completed Order (Delivered)
  const completedOrder = await OrderRequest.create({
    quantity: 20,
    status: "completed",
    requested_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    notes: "Monthly stock",
    requester_id: adminUser._id,
    supplier_id: suppliers[1]._id,
    approved_by: staffUser._id,
    approved_date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    notified: true,
    confirmed_by: adminUser._id,
    confirmed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  });
  orderRequests.push(completedOrder);

  // Create ApproveRequest
  await ApproveRequest.create({
    order_request_id: completedOrder._id,
    status: "approved",
    admin_remarks: "Routine restock",
    approved_by: staffUser._id,
    approved_date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
  });

  // Create ConfirmDelivery - Removed, merged into OrderRequest

  // 6. Another Completed Order
  const completedOrder2 = await OrderRequest.create({
    quantity: 50,
    status: "completed",
    requested_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    notes: "Event materials",
    requester_id: staffUser._id,
    supplier_id: suppliers[3]._id,
    approved_by: adminUser._id,
    approved_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    notified: true,
    confirmed_by: staffUser._id,
    confirmed_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
  });
  orderRequests.push(completedOrder2);

  await ApproveRequest.create({
    order_request_id: completedOrder2._id,
    status: "approved",
    approved_by: adminUser._id,
    approved_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  });

  // Create ConfirmDelivery - Removed, merged into OrderRequest

  // Seed OrderRequestItems
  for (const order of orderRequests) {
    // Add 1-3 random items per order
    const numItems = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numItems; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      try {
        await OrderRequestItem.create({
          order_request_id: order._id,
          product_id: product._id,
          quantity: Math.floor(Math.random() * 10) + 1,
          unit_price: product.price,
          subtotal: product.price * (Math.floor(Math.random() * 10) + 1),
        });
      } catch (e) {
        // Ignore duplicate key errors if we pick the same product
      }
    }
  }

  // Seed Sales
  const sales = [];
  for (let i = 0; i < 50; i++) {
    const saleDate = new Date(
      Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000,
    );
    const sale = await Sale.create({
      customer_id: Math.random() > 0.5 ? customerUser._id : null, // Some walk-in, some registered
      payment_method: ["Cash", "Credit Card", "Bank Transfer"][
        Math.floor(Math.random() * 3)
      ],
      status: "completed",
      completed_at: saleDate,
      createdAt: saleDate,
      updatedAt: saleDate,
    });
    sales.push(sale);

    // Add items to sale
    const numItems = Math.floor(Math.random() * 5) + 1;
    let totalAmount = 0;
    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const qty = Math.floor(Math.random() * 5) + 1;
      const subtotal = product.price * qty;
      await SaleItem.create({
        sale_id: sale._id,
        product_id: product._id,
        quantity: qty,
        price: product.price,
        cost_price: product.price * 0.7, // 30% margin
        discount: 0,
        subtotal: subtotal,
      });
      totalAmount += subtotal;
    }
    await sale.update({
      total_amount: totalAmount,
      grand_total: totalAmount,
      payment_status: "paid",
    });
  }

  // Seed Expenses
  const expenseCategories = [
    "Rent",
    "Utilities",
    "Salary",
    "Inventory",
    "Marketing",
    "Transport",
    "Other",
  ];
  for (let i = 0; i < 50; i++) {
    const date = new Date(
      Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000,
    );
    await Expense.create({
      description: `Expense for ${expenseCategories[Math.floor(Math.random() * expenseCategories.length)]} - ${Math.floor(Math.random() * 1000)}`,
      amount: (Math.random() * 1000 + 50).toFixed(2),
      category:
        expenseCategories[Math.floor(Math.random() * expenseCategories.length)],
      date: date,
      user_id: adminUser._id,
      status: "active",
      createdAt: date,
    });
  }

  // Notifications
  await Promise.all([
    Notification.create({
      user_id: adminUser._id,
      type: "order_request",
      message: "New order request submitted by customer.",
      entity_type: "OrderRequest",
      entity_id: orderRequests[0]._id,
      read: false,
    }),
    Notification.create({
      user_id: staffUser._id,
      type: "approve_request",
      message: "Order request approved.",
      entity_type: "OrderRequest",
      entity_id: approvedOrder._id,
      read: false,
    }),
  ]);

  // Activity Logs
  await Promise.all([
    ActivityLog.create({
      user_id: customerUser._id,
      action: "create_order_request",
      details: "Customer created order request",
      entity_type: "OrderRequest",
      entity_id: orderRequests[0]._id,
    }),
    ActivityLog.create({
      user_id: adminUser._id,
      action: "approve_order_request",
      details: "Admin approved order",
      entity_type: "OrderRequest",
      entity_id: approvedOrder._id,
    }),
  ]);

  console.log("Database seeded!");
  process.exit();
}

seed();
