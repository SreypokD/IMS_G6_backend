const { DataTypes } = require("sequelize");
const { sequelize } = require("./index");
const { generateObjectId } = require("../utils/objectId.util");

const Sale = sequelize.define(
  "Sale",
  {
    _id: {
      type: DataTypes.STRING(24),
      primaryKey: true,
      defaultValue: () => generateObjectId(),
    },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: "processing" },
    completed_at: { type: DataTypes.DATE },
  },
  { timestamps: true },
);

module.exports = Sale;
