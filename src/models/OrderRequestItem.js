const { DataTypes } = require("sequelize");
const { sequelize } = require("./index");

const OrderRequestItem = sequelize.define(
  "order_request_items",
  {
    _id: {
      type: DataTypes.STRING(24),
      primaryKey: true,
      defaultValue: () => require("../utils/objectId.util").generateObjectId(),
    },
    order_request_id: {
      type: DataTypes.STRING(24),
      allowNull: false,
      references: {
        model: "order_requests",
        key: "_id",
      },
    },
    product_id: {
      type: DataTypes.STRING(24),
      allowNull: false,
      references: {
        model: "products",
        key: "_id",
      },
    },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
  },
  { timestamps: true, tableName: "order_request_items" },
);

module.exports = OrderRequestItem;
