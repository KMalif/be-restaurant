const { handleServerError, handleClientError } = require("../helpers/handleError");
const { Menu, Purchase, Purchase_Group } = require("../models");
const joi = require("joi");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { CLIENT_RENEG_LIMIT } = require("tls");
const { uploadToCloudinary, cloudinaryDeleteImg } = require("../utils/cloudinary");

exports.getMenu = async (req, res) => {
  try {
    const response = await Menu.findAll();
    res.status(200).json({ message: "Success",status: 200, data: response });
  } catch (error) {
    return handleServerError(res);
  }
};

exports.getPurchaseMenu = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const response = await Purchase_Group.findAll({
      include: [
        {
          model: Purchase,
        },
      ],
      where: { userID: decoded.data.id },
    });
    res.status(200.0).json({ data: response, message: "Success" });
  } catch (error) {
    console.error(error);
    return handleServerError(res);
  }
};

exports.getAllPurchaseMenu = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const response = await Purchase_Group.findAll({
      include: [
        {
          model: Purchase,
        },
      ],
      where: {
        status: "Order Receive",
        date: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
    });

    res.status(200).json({ message: "Success",status: 200, data: response });
  } catch (error) {
    return handleServerError(res);
  }
};

exports.getMenubyID = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await Menu.findOne({
      where: { id: id },
    });
    if (!response) {
      return handleClientError(res, 404, `Menu Not Found...`);
    }
    res.status(200).json({ message: "Success",status: 200, data: response });
  } catch (error) {
    return handleServerError(res);
  }
};

exports.createMenu = async (req, res) => {
  let menuImgUrl;
  try {
    const newData = req.body;

    if (req?.fileValidationError){
      return handleClientError(
        res,
        400,
        'Bad Request'
      );
    };

    if (!req?.files?.image) return handleClientError(res, 400, 'Image is required');

    const scheme = joi.object({
      name: joi.string().required(),
      categoryID: joi.number().integer().required(),
      description: joi.string().allow(""),
      type: joi.string().required(),
      price: joi.number().integer().required(),
      qty: joi.number().integer().min(0).required(),
    });

    const { error } = scheme.validate(newData);
    if (error) {
      return handleClientError(res, 400, error.details[0].message);
    }

    const existingMenu = await Menu.findOne({ where: { name: newData.name } });
    if (existingMenu) {
      return handleClientError(res, 400, `Menu ${newData.name} already exist...`);
    }

    menuImgUrl = await uploadToCloudinary(req.files.image[0], 'image');

    const newMenu = await Menu.create({
      ...newData,
      image: menuImgUrl?.url
    });

    res.status(201).json({ message: "Menu Created...", status: 201, data: newData });
  } catch (error) {
    console.log(error.message, "create menu");
    return handleServerError(res);
  }
};

exports.editMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const scheme = joi.object({
      name: joi.string().required(),
      categoryID: joi.number().integer().required(),
      description: joi.string().allow(""),
      type: joi.string().required(),
      price: joi.number().integer().required(),
      qty: joi.number().integer().min(0).required(),
    });

    const menu = await Menu.findOne({ where: { id } });

    if (!menu) {
      return handleClientError(res, 404, `Menu with ID ${id} not found.`);
    }

    if (req.files.image) {
      const imagePublicID = menu?.image.split("/").pop().split(".")[0];
      const deletedImage = await cloudinaryDeleteImg(`image/${imagePublicID}`);
      const imageResult = await uploadToCloudinary(req?.files?.image[0], 'image');
      updatedData.image = imageResult?.url;
    }

    await menu.update(updatedData);
    const menuUpdated = await Menu.findOne({ where: { id } });

    res.status(200).json({ data: menuUpdated, message: "Menu updated successfully." });
  } catch (error) {
    console.log(error, "<< ERR");
    return handleServerError(res);
  }
};

exports.deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const selectedMenu = await Menu.findOne({ where: { id: id } });

    if (!selectedMenu) {
      return res.status(404).json({ message: `Menu Not Found` });
    }

    const imagePublicID = selectedMenu?.image.split("/").pop().split(".")[0];
    const deletedImage = await cloudinaryDeleteImg(`image/${imagePublicID}`);

    console.log(deletedImage, "delete response");

    const purchase = await Purchase.findOne({ where: { menuID: id } });
    if (purchase) {
      return handleClientError(res, 404, `Unable to delete the menu due to its association with existing purchase data.`);
    }

    await Menu.destroy({ where: { id: id } });

    res.status(200).json({ message: "Menu have been deleted" });
  } catch (error) {
    console.log(error);
    return handleServerError(res);
  }
};
