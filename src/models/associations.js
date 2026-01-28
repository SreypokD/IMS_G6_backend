const User = require("./User");
const Product = require("./Product");
const Category = require("./Category");
const Supplier = require("./Supplier");
const OrderRequest = require("./OrderRequest");
const Permission = require("./Permission");

// ================= Associations =================

// Product-Category: Many Products belong to one Category
Product.belongsTo(Category);
Category.hasMany(Product);

// Product-Supplier: Many Products belong to one Supplier
Product.belongsTo(Supplier);
Supplier.hasMany(Product);

// OrderRequest-Product: Many OrderRequests belong to one Product
OrderRequest.belongsTo(Product);
Product.hasMany(OrderRequest);

// User-OrderRequest: One User (requester) can have many OrderRequests
OrderRequest.belongsTo(User, { as: "requester" });
User.hasMany(OrderRequest, { foreignKey: "requesterId" });

// User-Permission (Role):
// Each User belongs to one Permission (role), and each Permission can have many Users.
// The Permission model contains a 'permissions' array for menu/action access.
User.belongsTo(Permission, { foreignKey: "permissionId", as: "permission" });
Permission.hasMany(User, { foreignKey: "permissionId", as: "users" });

module.exports = {
  User,
  Product,
  Category,
  Supplier,
  OrderRequest,
  Permission,
};
