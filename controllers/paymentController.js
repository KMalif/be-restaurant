const { handleServerError, handleClientError } = require("../helpers/handleError");
const { Menu, Purchase, Purchase_Group, Payment } = require("../models");
const joi = require("joi");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");

exports.createPurchase = async (req, res) => {
  try {
    const snap = req.snap;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const newData = req.body;
    let total = 0;
    const scheme = joi.object({
      items: joi
        .array()
        .items(
          joi.object({
            menuIDs: joi.number().required(),
            qtys: joi.number().required(),
          })
        )
        .min(1)
        .required(),
      note: joi.string().allow(""),
    });

    const { error } = scheme.validate(newData);
    if (error) {
      return handleClientError(res, 400, error.details[0].message);
    }
    const menuIDs = newData.items.map((item) => item.menuIDs);
    const qtys = newData.items.map((item) => item.qtys);

    if (menuIDs.length !== qtys.length) {
      return handleClientError(res, 400, "Menu IDs and quantities must have the same number of elements.");
    }

    for (let i = 0; i < menuIDs.length; i++) {
      const menuID = menuIDs[i];
      const qty = qtys[i];

      const existingMenu = await Menu.findOne({ where: { id: menuID } });
      if (!existingMenu) {
        return handleClientError(res, 404, `Menu not found...`);
      }

      if (existingMenu.qty < 1) {
        return handleClientError(res, 400, `${existingMenu.name} not available...`);
      }
    }

    for (let i = 0; i < menuIDs.length; i++) {
      const menuID = menuIDs[i];
      const qty = qtys[i];

      const menu = await Menu.findOne({ where: { id: menuID } });

      total += menu.price * qty;
    }
    function addHoursToDate(date, hours) {
      return new Date(date.getTime() + hours * 60 * 60 * 1000);
    }
    const nowDate = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
    const paymentData = {
      userID: decoded.data.id,
      total: total,
      method: "Pending",
      status: "Pending",
      date: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
    };
    let newPayment = await Payment.create(paymentData);

    const purchaseGroupData = {
      userID: decoded.data.id,
      paymentID: newPayment.id,
      username: decoded.data.fullName,
      note: newData.note,
      status: "Pending Payment",
      date: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
    };

    const newPurchaseGroup = await Purchase_Group.create(purchaseGroupData);
    const payload = {
      total: total,
      purchaseGroupData: newPurchaseGroup,
    };

    const dataToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    let customerDetails = {
      first_name: decoded.data.fullName,
      email: decoded.data.email,
      phone: decoded.data.phoneNumber,
    };

    let items = await Promise.all(
      menuIDs.map(async (menuID, index) => {
        const menu = await Menu.findOne({ where: { id: menuID } });
        return {
          id: menu.id,
          price: menu.price,
          quantity: qtys[index],
          name: menu.name,
        };
      })
    );
    let midtransTransaction = {
      transaction_details: {
        order_id: "order-" + new Date().getTime(),
        gross_amount: total,
      },
      item_details: items,
      customer_details: customerDetails,
      payload_token: dataToken,
    };
    let transactionResult = await snap.createTransaction(midtransTransaction);
    let paymentUrl = transactionResult.redirect_url;
    for (let i = 0; i < menuIDs.length; i++) {
      const menuID = menuIDs[i];
      const qty = qtys[i];

      const menu = await Menu.findOne({ where: { id: menuID } });
      const purchaseData = {
        menuID: menuID,
        userID: decoded.data.id,
        purchase_groupID: newPurchaseGroup.id,
        namaMenu: menu.name,
        typeMenu: menu.type,
        qty: qty,
        price: menu.price * qty,
      };
      await Purchase.create(purchaseData);
    }

    res.status(201).json({
      message: "Request for Payment.",
      paymentUrl: paymentUrl,
      token: dataToken,
    });
  } catch (error) {
    console.log(error);
    return handleServerError(res);
  }
};
exports.notificationMidtrans = async (req, res) => {
  try {
    const payloadToken = req.headers["token"];
    const decoded = jwt.verify(payloadToken, process.env.JWT_SECRET);
    function addHoursToDate(date, hours) {
      return new Date(date.getTime() + hours * 60 * 60 * 1000);
    }
    const nowDate = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
    const notification = {
      purchaseGroupID: decoded.purchaseGroupData.id,
      order_id: decoded.purchaseGroupData.paymentID,
      transaction_status: "settlement",
      gross_amount: decoded.total,
      payment_type: "bank_transfer",
      transaction_time: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
    };

    if (notification.transaction_status === "settlement") {
      await Payment.update({ status: "Success", date: notification.transaction_time, method: notification.payment_type }, { where: { id: notification.order_id } });
      await Purchase_Group.update({ status: "Order Receive" }, { where: { id: notification.purchaseGroupID } });

      res.status(201).json({
        message: "Payment Success",
      });
    } else {
      return handleClientError(res, 400, "Payment Unsuccessfully");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
