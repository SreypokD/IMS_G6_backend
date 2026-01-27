require("dotenv").config({ path: "../environments/.env" });
const { sequelize } = require("../src/models");
const {
  User,
  Product,
  Category,
  Supplier,
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
    { name: "Acme Corp", contact: "acme@example.com" },
    { name: "Global Supplies", contact: "global@example.com" },
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
      SupplierId: suppliers[0]._id,
    },
    {
      code: "P002",
      name: "Desk Chair",
      description: "Ergonomic chair",
      quantity: 20,
      price: 150,
      category: "Furniture",
      CategoryId: categories[2]._id,
      SupplierId: suppliers[1]._id,
    },
    {
      code: "P003",
      name: "Notebook",
      description: "A4 ruled",
      quantity: 100,
      price: 2,
      category: "Stationery",
      CategoryId: categories[1]._id,
      SupplierId: suppliers[1]._id,
    },
  ]);

  // Seed users (now using email and more info)
  const password = await bcrypt.hash("admin123", 10);
  await User.create({
    email: "admin@example.com",
    password,
    role: "admin",
    name: "Admin User",
    phone: "0123456789",
    address: "123 Admin St, City",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    permissions: [
      "view_dashboard",
      "view_product",
      "create_product",
      "update_product",
      "delete_product",
      "view_category",
      "create_category",
      "update_category",
      "delete_category",
      "view_supplier",
      "create_supplier",
      "update_supplier",
      "delete_supplier",
      "view_order_request",
      "create_order_request",
      "update_order_request",
      "delete_order_request",
      "post_order_request",
      "view_stock",
      "view_report",
      "view_permission",
      "create_permission",
      "update_permission",
      "delete_permission",
      "view_user",
      "create_user",
      "update_user",
      "delete_user",
    ],
  });
  await User.create({
    email: "staff@example.com",
    password,
    role: "staff",
    name: "Staff User",
    phone: "0987654321",
    address: "456 Staff Ave, City",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    permissions: [
      "view_dashboard",
      "view_category",
      "view_supplier",
      "view_order_request",
      "create_order_request",
      "update_order_request",
      "delete_order_request",
      "view_report",
    ],
  });

  console.log("Database seeded!");
  process.exit();
}

seed();
