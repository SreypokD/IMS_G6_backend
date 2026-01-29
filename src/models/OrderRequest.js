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
    status: { type: DataTypes.STRING, defaultValue: "pending" },
    requested_date: { type: DataTypes.DATE },
    notes: { type: DataTypes.STRING },
    admin_remarks: { type: DataTypes.STRING },
    rejection_reason: { type: DataTypes.STRING },
    notified: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { timestamps: true },
);

module.exports = OrderRequest;
