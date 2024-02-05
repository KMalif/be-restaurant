const { handleServerError, handleClientError } = require("../helpers/handleError");
const { Menu, Purchase_Group } = require("../models");

exports.disabledMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const qty = 0;

    const menu = await Menu.findOne({ where: { id } });

    if (!menu) {
      return handleClientError(res, 404, `Menu with ID ${id} not found.`);
    }

    if (menu.qty == 0) {
      return handleClientError(res, 400, `Menu with name ${menu.name} already disabled`);
    }

    await menu.update({ qty: qty });
    const menuUpdated = await Menu.findOne({ where: { id } });

    res.status(200).json({ data: menuUpdated, message: "Menu successfully disabled." });
  } catch (error) {
    return handleServerError(res);
  }
};

exports.reactivatedMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const qty = 1;

    const menu = await Menu.findOne({ where: { id } });

    if (!menu) {
      return handleClientError(res, 404, `Menu with ID ${id} not found.`);
    }

    if (menu.qty == 1) {
      return handleClientError(res, 400, `Menu with name ${menu.name} already active`);
    }

    await menu.update({ qty: qty });
    const menuUpdated = await Menu.findOne({ where: { id } });

    res.status(200).json({ data: menuUpdated, message: "Menu successfully enabled." });
  } catch (error) {
    return handleServerError(res);
  }
};
exports.serveMenu = async (req, res) => {
  try {
    const { id } = req.body;

    const purchase = await Purchase_Group.findOne({ where: { id } });
    if (!purchase) {
      return handleClientError(res, 404, `Purchase Group with ID ${id} not found.`);
    }

    await purchase.update({ status: "Pick Up" });
    const purchaseGroupUpdated = await Purchase_Group.findOne({ where: { id } });

    res.status(200).json({ data: purchaseGroupUpdated, message: "Menu successfully serve." });
  } catch (error) {
    console.log(error);
    return handleServerError(res);
  }
};
