const { DataTypes } = require("sequelize");
const { sequelize } = require("./index");

const { generateObjectId } = require("../utils/objectId.util");
const User = sequelize.define(
  "User",
  {
    _id: {
      type: DataTypes.STRING(24),
      primaryKey: true,
      defaultValue: () => generateObjectId(),
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "user",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ["view_dashboard"],
      validate: {
        isArrayOfStrings(value) {
          if (
            !Array.isArray(value) ||
            !value.every((v) => typeof v === "string")
          ) {
            throw new Error("Permissions must be an array of strings");
          }
        },
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = User;
