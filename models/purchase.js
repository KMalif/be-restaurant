"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Purchase extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Purchase.belongsTo(models.Menu, {
        foreignKey: {
          name: "menuID",
        },
      });
      Purchase.belongsTo(models.User, {
        foreignKey: {
          name: "userID",
        },
      });
      Purchase.belongsTo(models.Purchase_Group, {
        foreignKey: {
          name: "purchase_groupID",
        },
      });
    }
  }
  Purchase.init(
    {
      menuID: DataTypes.INTEGER,
      userID: DataTypes.INTEGER,
      purchase_groupID: DataTypes.INTEGER,
      namaMenu: DataTypes.STRING,
      typeMenu: DataTypes.STRING,
      qty: DataTypes.INTEGER,
      price: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Purchase",
    }
  );
  return Purchase;
};
