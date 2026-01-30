const { DataTypes } = require("sequelize");
const { sequelize } = require("./index");
const { generateObjectId } = require("../utils/objectId.util");

const OrderRequest = sequelize.define(
  "OrderRequest",
  {
    _id: {
      type: DataTypes.STRING(24),
      primaryKey: true,
      defaultValue: () => generateObjectId(),
    },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: "pending" }, // possible: pending, approved, rejected, completed, cancelled, on_hold
    requested_date: { type: DataTypes.DATE },
    notes: { type: DataTypes.STRING },
    customer_remark: { type: DataTypes.STRING },
    delivery_date: { type: DataTypes.DATE },
    updated_by: { type: DataTypes.STRING(24) },
    updated_at: { type: DataTypes.DATE },
    admin_remarks: { type: DataTypes.STRING },
    rejection_reason: { type: DataTypes.STRING },
    notified: { type: DataTypes.BOOLEAN, defaultValue: false },
    approved_by: { type: DataTypes.STRING(24) },
    approved_date: { type: DataTypes.DATE },
    admin_remark: { type: DataTypes.STRING },
    requester_id: {
      type: DataTypes.STRING(24),
      allowNull: false,
      references: {
        model: "users",
        key: "_id",
      },
    },
  },
  { timestamps: true, tableName: "order_requests" },
);

module.exports = OrderRequest;
