const { DataTypes } = require("sequelize");
const { sequelize } = require("./index");

const { generateObjectId } = require("../utils/objectId.util");
const Product = sequelize.define(
  "Product",
  {
    _id: {
      type: DataTypes.STRING(24),
      primaryKey: true,
      defaultValue: () => generateObjectId(),
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING },
    price: { type: DataTypes.FLOAT, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    subcategory: { type: DataTypes.STRING },
    image: { type: DataTypes.STRING },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { timestamps: true },
);

module.exports = Product;
