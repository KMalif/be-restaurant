"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Purchase_Groups", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userID: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
      },
      paymentID: {
        type: Sequelize.INTEGER,
        references: {
          model: "Payments",
          key: "id",
        },
      },
      username: {
        type: Sequelize.STRING,
      },
      note: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING,
      },
      date: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable("Purchase_Groups");
  },
};
