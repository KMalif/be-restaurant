const { handleServerError, handleClientError } = require("../helpers/handleError");
const { Category, Menu, Purchase } = require("../models");
const joi = require("joi");

exports.getCategory = async (req, res) => {
  try {
    const response = await Category.findAll();
    res.status(200).json({ message: "Success get All Category", status: 200, data: response });
  } catch (error) {
    return handleServerError(res);
  }
};

exports.getCategoryMenu = async (req, res) => {
  try {
    const response = await Category.findAll({
      include: Menu,
    });
    res.status(200).json({ message: "Success", status: 200, data: response });
  } catch (error) {
    return handleServerError(res);
  }
};

exports.getCategoryMenubyID = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await Category.findOne({
      include: Menu,
      where: { id: id },
    });
    if (!response) {
      return handleClientError(res, 404, `Category Not Found...`);
    }
    res.status(200).json({ message: "Success", status: 200, data: response });
  } catch (error) {
    return handleServerError(res);
  }
};

exports.createCategory = async (req, res) => {
  try {
    const newData = req.body;
    const scheme = joi.object({
      name: joi.string().required(),
    });

    const { error } = scheme.validate(newData);
    if (error) {
      return handleClientError(res, 400, error.details[0].message);
    }

    const existingCategory = await Category.findOne({ where: { name: newData.name } });
    if (existingCategory) {
      return handleClientError(res, 400, `Category with name ${newData.name} already exist...`);
    }

    const newCategory = await Category.create(newData);

    res.status(201).json({ message: "Category Created...", status: 201, data: newCategory });
  } catch (error) {
    return handleServerError(res);
  }
};

exports.editCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const newData = req.body;
    const scheme = joi.object({
      name: joi.string().required(),
    });
    const { error } = scheme.validate(newData);
    if (error) {
      return handleClientError(res, 400, error.details[0].message);
    }

    const selectedCategory = await Category.findOne({ where: { id: id } });
    if (!selectedCategory) {
      return handleClientError(res, 404, `Category Not Found`);
    }
    await Category.update(newData, { where: { id: id } });
    const updatedCategory = await Category.findOne({ where: { id: id } });

    res.status(200).json({ message: "Category Updated...", status: 200, data: updatedCategory });
  } catch (error) {
    return handleServerError(res);
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const selectedCategory = await Category.findOne({ where: { id: id } });

    if (!selectedCategory) {
      return handleClientError(res, 404, `Category Not Found`);
    }

    const menus = await Menu.findAll({ where: { categoryID: id } });

    for (const menu of menus) {
      const purchase = await Purchase.findAll({ where: { menuID: menu.id } });
      if (purchase) {
        return handleClientError(res, 400, `Unable to delete the category due to its association with existing menu data.`);
      }
    }

    for (const menu of menus) {
      await menu.destroy({ where: { id: menu.id } });
    }

    await Category.destroy({ where: { id: id } });

    res.status(200).json({ message: "Category have been deleted", status: 200, data: selectedCategory });
  } catch (error) {
    return handleServerError(res);
  }
};
