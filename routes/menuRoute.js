const express = require("express");
const router = express.Router();

const { authenticateAdmin } = require("../middleware/authenticateAdmin");
const { authenticateUser } = require("../middleware/authenticateUser");
const { getMenu, getMenubyID, createMenu, editMenu, deleteMenu, getPurchaseMenu, getAllPurchaseMenu } = require("../controllers/menuController");
const uploadMedia = require("../middleware/uploadMedia");

router.get("/", getMenu);
router.get("/:id", getMenubyID);

router.use(authenticateUser);
router.get("/purchase/order", getPurchaseMenu);


router.use(authenticateAdmin);
router.get("/purchase/all-order", getAllPurchaseMenu);
router.post("/", uploadMedia.fields([{ name: 'image', maxCount: 1 }]), createMenu);
router.put("/:id", uploadMedia.fields([{ name: 'image', maxCount: 1 }]), editMenu);
router.delete("/:id", deleteMenu);

module.exports = router;
