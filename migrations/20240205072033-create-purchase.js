"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Purchases", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      menuID: {
        type: Sequelize.INTEGER,
        references: {
          model: "Menus",
          key: "id",
        },
      },
      userID: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
      },
      purchase_groupID: {
        type: Sequelize.INTEGER,
        references: {
          model: "Purchase_Groups",
          key: "id",
        },
      },
      namaMenu: {
        type: Sequelize.STRING,
      },
      typeMenu: {
        type: Sequelize.STRING,
      },
      qty: {
        type: Sequelize.INTEGER,
      },
      price: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Purchases");
  },
};
