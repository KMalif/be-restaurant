"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Purchase_Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Purchase_Group.hasMany(models.Purchase, {
        foreignKey: {
          name: "purchase_groupID",
        },
        onDelete: "CASCADE",
      });
      Purchase_Group.belongsTo(models.User, {
        foreignKey: {
          name: "userID",
        },
      });
      Purchase_Group.belongsTo(models.Payment, {
        foreignKey: {
          name: "paymentID",
        },
      });
    }
  }
  Purchase_Group.init(
    {
      userID: DataTypes.INTEGER,
      paymentID: DataTypes.INTEGER,
      username: DataTypes.STRING,
      note: DataTypes.STRING,
      status: DataTypes.STRING,
      date: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Purchase_Group",
    }
  );
  return Purchase_Group;
};
