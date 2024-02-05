const { handleClientError, handleServerError } = require("../helpers/handleError");
const { User } = require("../models");
const joi = require("joi");
const { hash, compareHash } = require("../utils/bcrypt");
const { generateToken, generateTokenReset } = require("../utils/generateToken");
const { authenticateAdmin } = require("../middleware/authenticateAdmin");
const sendForgotPasswordEmail = require("../helpers/nodemailer");
const jwt = require("jsonwebtoken");
var zlib = require("zlib");

exports.login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const scheme = joi.object({
      email: joi.string().email({ tlds: { allow: false } }),
      password: joi.string().min(6).required(),
    });

    const { error } = scheme.validate({ email, password });
    if (error) {
      return handleClientError(res, 400, error.details[0].message);
    }
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return handleClientError(res, 404, "User Not Found");
    }

    const login = await compareHash(password, email);
    if (!login) {
      return handleClientError(res, 400, "Incorrect Password");
    }
    user.password = undefined;

    const token = generateToken(user);
    res.status(200).json({ message: "Login Sucess", status: 200, token: token });
  } catch (error) {
    return handleServerError(res);
  }
};

exports.register = async (req, res) => {
  try {
    const newData = req.body;
    const scheme = joi.object({
      fullName: joi.string().min(3).required(),
      phoneNumber: joi.number().required(),
      email: joi.string().email({ tlds: { allow: false } }),
      password: joi.string().min(6).required(),
    });

    const { error } = scheme.validate(newData);
    if (error) {
      return handleClientError(res, 400, error.details[0].message);
    }

    const existingUser = await User.findOne({ where: { email: newData.email } });
    if (existingUser) {
      return handleClientError(res, 400, `User with email ${newData.email} already exist...`);
    }

    const hashingPassword = hash(newData.password);
    newData.password = hashingPassword;
    newData.role = 2;

    await User.create(newData);

    res.status(201).json({ message: "User Created..." });
  } catch (error) {
    return handleServerError(res);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const scheme = joi.object({
      email: joi.string().email({ tlds: { allow: false } }),
    });
    const { error } = scheme.validate({ email });
    if (error) {
      return handleClientError(res, 400, error.details[0].message);
    }

    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return handleClientError(res, 404, "User Not Found");
    }

    const token = generateTokenReset(user);
    sendForgotPasswordEmail(email, token);

    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.log(error);
    return handleServerError(res);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const scheme = joi.object({
      newPassword: joi.string().min(6).required(),
      confirmPassword: joi.string().valid(joi.ref("newPassword")).required(),
    });

    const { error } = scheme.validate({ newPassword, confirmPassword });
    if (error) {
      return handleClientError(res, 400, error.details[0].message);
    }

    let { token } = req.params;
    token = token.replace(/_/g, "/");
    token = Buffer.from(token, "base64");

    let decompressedToken;
    try {
      decompressedToken = zlib.inflateSync(token).toString();
    } catch (decompressionError) {
      return handleClientError(res, 400, "Invalid token format");
    }
    const decoded = jwt.verify(decompressedToken, process.env.JWT_SECRET);

    const hashingPassword = hash(newPassword);
    const hashedPassword = hashingPassword;

    await User.update({ password: hashedPassword }, { where: { email: decoded.data.email } });

    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.log(error);
    return handleServerError(res);
  }
};
