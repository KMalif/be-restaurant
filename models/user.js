"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Purchase, {
        foreignKey: {
          name: "userID",
        },
        onDelete: "CASCADE",
      });
      User.hasMany(models.Purchase_Group, {
        foreignKey: {
          name: "userID",
        },
        onDelete: "CASCADE",
      });
      User.hasMany(models.Payment, {
        foreignKey: {
          name: "userID",
        },
        onDelete: "CASCADE",
      });
    }
  }
  User.init(
    {
      fullName: DataTypes.STRING,
      role: DataTypes.INTEGER,
      phoneNumber: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      imageUrl: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
