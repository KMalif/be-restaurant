const express = require("express");
const router = express.Router();
const { login, register, forgotPassword, resetPassword } = require("../controllers/userController");

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

module.exports = router;
