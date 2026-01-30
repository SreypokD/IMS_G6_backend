const User = require("./User");
const Product = require("./Product");
const Category = require("./Category");
const Supplier = require("./Supplier");
const OrderRequest = require("./OrderRequest");
const OrderRequestItem = require("./OrderRequestItem");
const Permission = require("./Permission");
const Sale = require("./Sale");
const ActivityLog = require("./ActivityLog");
const Notification = require("./Notification");

// ================= Associations =================

// Product-Category: Many Products belong to one Category
Product.belongsTo(Category, { foreignKey: "category_id", as: "category" });
Category.hasMany(Product, { foreignKey: "category_id", as: "products" });

// Product-Supplier: Many Products belong to one Supplier
Product.belongsTo(Supplier, { foreignKey: "supplier_id", as: "supplier" });
Supplier.hasMany(Product, { foreignKey: "supplier_id", as: "products" });

// OrderRequest-Product: Many OrderRequests belong to one Product
OrderRequest.belongsTo(Product, { foreignKey: "product_id", as: "product" });
Product.hasMany(OrderRequest, {
  foreignKey: "product_id",
  as: "order_requests",
});

// User-OrderRequest: One User (requester) can have many OrderRequests
OrderRequest.belongsTo(User, { foreignKey: "requester_id", as: "requester" });
User.hasMany(OrderRequest, {
  foreignKey: "requester_id",
  as: "order_requests",
});

// User-Permission (Role):
User.belongsTo(Permission, { foreignKey: "permission_id", as: "permission" });
Permission.hasMany(User, { foreignKey: "permission_id", as: "users" });

// Sale-OrderRequest: Each Sale belongs to one OrderRequest
Sale.belongsTo(OrderRequest, {
  foreignKey: "order_request_id",
  as: "order_request",
});
OrderRequest.hasOne(Sale, { foreignKey: "order_request_id", as: "sale" });

// Sale-Product: Each Sale belongs to one Product
Sale.belongsTo(Product, { foreignKey: "product_id", as: "product" });
Product.hasMany(Sale, { foreignKey: "product_id", as: "sales" });

// OrderRequest-OrderRequestItem: One OrderRequest has many OrderRequestItems
OrderRequest.hasMany(OrderRequestItem, { foreignKey: "order_request_id", as: "order_request_items"});
OrderRequestItem.belongsTo(OrderRequest, { foreignKey: "order_request_id", as: "order_request"});

// Product-OrderRequestItem: One Product has many OrderRequestItems
Product.hasMany(OrderRequestItem, { foreignKey: "product_id", as: "order_request_items"});
OrderRequestItem.belongsTo(Product, { foreignKey: "product_id", as: "product"});

// ActivityLog-User: Each ActivityLog belongs to a User
ActivityLog.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(ActivityLog, { foreignKey: "user_id", as: "activity_logs" });

// Notification associations
User.hasMany(Notification, { foreignKey: "user_id", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = {
  User,
  Product,
  Category,
  Supplier,
  OrderRequest,
  Permission,
  Sale,
  ActivityLog,
  Notification,
  OrderRequestItem,
};
