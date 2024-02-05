const express = require("express");
const userRoute = require("./userRoute");
const adminRoute = require("./adminRoute");
const categoryRoute = require("./categoryRoute");
const menuRoute = require("./menuRoute");
const paymentRoute = require("./paymentRoute");

const router = express.Router();

router.use("/user", userRoute);
router.use("/admin", adminRoute);
router.use("/category", categoryRoute);
router.use("/menu", menuRoute);
router.use("/payment", paymentRoute);

module.exports = router;
