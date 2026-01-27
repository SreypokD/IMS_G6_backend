const { DataTypes } = require("sequelize");
const { sequelize } = require("./index");

const { generateObjectId } = require("../utils/objectId.util");
const Supplier = sequelize.define(
  "Supplier",
  {
    _id: {
      type: DataTypes.STRING(24),
      primaryKey: true,
      defaultValue: () => generateObjectId(),
    },
    name: { type: DataTypes.STRING, allowNull: false },
    contact: { type: DataTypes.STRING },
  },
  { timestamps: true },
);

module.exports = Supplier;
