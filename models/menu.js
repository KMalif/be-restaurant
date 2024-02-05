"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Menu extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Menu.hasMany(models.Purchase, {
        foreignKey: {
          name: "menuID",
        },
        onDelete: "CASCADE",
      });

      Menu.belongsTo(models.Category, {
        foreignKey: {
          name: "categoryID",
        },
      });
    }
  }
  Menu.init(
    {
      name: DataTypes.STRING,
      categoryID: DataTypes.INTEGER,
      description: DataTypes.STRING,
      type: DataTypes.STRING,
      image: DataTypes.STRING,
      price: DataTypes.INTEGER,
      qty: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Menu",
    }
  );
  return Menu;
};
