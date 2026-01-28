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
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
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
    address: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    profile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    permissionId: {
      type: DataTypes.STRING(24),
      allowNull: true,
      references: {
        model: "Permissions",
        key: "_id",
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = User;
