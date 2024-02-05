const express = require("express");
const router = express.Router();

const { authenticateAdmin } = require("../middleware/authenticateAdmin");
const { getCategory, getCategoryMenu, getCategoryMenubyID, createCategory, editCategory, deleteCategory } = require("../controllers/categoryController");

router.get("/", getCategory);
router.get("/menu", getCategoryMenu);
router.get("/menu/:id", getCategoryMenubyID);

router.use(authenticateAdmin);
router.post("/", createCategory);
router.put("/:id", editCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
