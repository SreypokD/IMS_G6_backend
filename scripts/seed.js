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
} = require("../src/models/associations");

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
    { name: "Food & Beverage", description: "Groceries and drinks" },
    { name: "Clothing", description: "Apparel and accessories" },
    { name: "Health & Beauty", description: "Personal care products" },
    {
      name: "Sports & Outdoors",
      description: "Sporting goods and outdoor gear",
    },
    { name: "Automotive", description: "Car parts and accessories" },
    { name: "Toys & Games", description: "Children's toys and games" },
    { name: "Books & Media", description: "Books, music, and movies" },
    { name: "Office Supplies", description: "Supplies for office use" },
    {
      name: "Cleaning Supplies",
      description: "Products for cleaning and maintenance",
    },
    { name: "Pet Supplies", description: "Products for pets" },
    {
      name: "Garden & Outdoor",
      description: "Gardening tools and outdoor equipment",
    },
    { name: "Baby Products", description: "Products for babies and toddlers" },
    { name: "Hardware", description: "Tools and hardware supplies" },
    { name: "Software", description: "Computer software and licenses" },
    { name: "Music Instruments", description: "Instruments and accessories" },
    { name: "Art Supplies", description: "Materials for artists" },
    { name: "Travel & Luggage", description: "Travel bags and accessories" },
    { name: "Jewelry", description: "Fashion jewelry and accessories" },
    { name: "Watches", description: "Wristwatches and accessories" },
    { name: "Footwear", description: "Shoes and footwear" },
    { name: "Accessories", description: "Fashion accessories" },
    { name: "Gadgets", description: "Unique gadgets and tech" },
    { name: "Collectibles", description: "Collectible items and memorabilia" },
    { name: "Musical Instruments", description: "Instruments and music gear" },
    { name: "Industrial Supplies", description: "Supplies for industrial use" },
    {
      name: "Medical Supplies",
      description: "Healthcare products and equipment",
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
  const adminUser = await User.create({
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
  });

  const staffUser = await User.create({
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
  });

  const customerPassword = await bcrypt.hash("customer123", 10);
  const customerUser = await User.create({
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
      note: "Initial purchase",
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
      note: "Customer sale",
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
      note: "Initial stock",
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
      note: "Bulk purchase",
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
      note: "Initial stock",
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
      note: "New shipment",
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
      note: "Damaged during transport",
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
