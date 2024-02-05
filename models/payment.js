"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Payment.hasMany(models.Purchase_Group, {
        foreignKey: {
          name: "paymentID",
        },
        onDelete: "CASCADE",
      });
      Payment.belongsTo(models.User, {
        foreignKey: {
          name: "userID",
        },
      });
    }
  }
  Payment.init(
    {
      userID: DataTypes.INTEGER,
      total: DataTypes.INTEGER,
      method: DataTypes.STRING,
      status: DataTypes.STRING,
      date: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Payment",
    }
  );
  return Payment;
};
