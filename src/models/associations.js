const User = require("./User");
const Product = require("./Product");
const Category = require("./Category");
const Supplier = require("./Supplier");
const OrderRequest = require("./OrderRequest");

// Associations
Product.belongsTo(Category);
Category.hasMany(Product);

Product.belongsTo(Supplier);
Supplier.hasMany(Product);

OrderRequest.belongsTo(Product);
Product.hasMany(OrderRequest);

OrderRequest.belongsTo(User, { as: "requester" });
User.hasMany(OrderRequest, { foreignKey: "requesterId" });

module.exports = { User, Product, Category, Supplier, OrderRequest };
