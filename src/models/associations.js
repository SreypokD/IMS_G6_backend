const User = require("./User");
const Product = require("./Product");
const Category = require("./Category");
const Supplier = require("./Supplier");
const OrderRequest = require("./OrderRequest");
const Permission = require("./Permission");
const Sale = require("./Sale");
const ActivityLog = require("./ActivityLog");

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
User.hasMany(OrderRequest, { foreignKey: "requester_id" });

// User-Permission (Role):
// Each User belongs to one Permission (role), and each Permission can have many Users.
// The Permission model contains a 'permissions' array for menu/action access.
User.belongsTo(Permission, { foreignKey: "permission_id", as: "permission" });
Permission.hasMany(User, { foreignKey: "permission_id", as: "users" });

// Sale-OrderRequest: Each Sale belongs to one OrderRequest
Sale.belongsTo(OrderRequest);
OrderRequest.hasOne(Sale);

// Sale-Product: Each Sale belongs to one Product
Sale.belongsTo(Product);
Product.hasMany(Sale);

// ActivityLog-User: Each ActivityLog belongs to a User
ActivityLog.belongsTo(User);
User.hasMany(ActivityLog);

module.exports = {
  User,
  Product,
  Category,
  Supplier,
  OrderRequest,
  Permission,
  Sale,
  ActivityLog,
};
