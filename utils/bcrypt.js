const bcrypt = require("bcrypt");
const salt = 10;
const { User } = require("../models");

const hash = (password) => {
  return bcrypt.hashSync(password, salt);
};

const compareHash = async (password, email) => {
  const user = await User.findOne({ where: { email: email } });

  const isMatch = await bcrypt.compare(password, user.password);
  return isMatch;
};

module.exports = {
  hash,
  compareHash,
};
