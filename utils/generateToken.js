var jwt = require("jsonwebtoken");
var zlib = require("zlib");

const generateToken = (data) => {
  return jwt.sign(
    {
      expiresIn: '24h',
      data: data,
    },
    process.env.JWT_SECRET
  );
};

const generateCompressedToken = (jwtToken) => {
  const compressedToken = zlib.deflateSync(Buffer.from(jwtToken)).toString("base64");
  return compressedToken;
};

const generateTokenReset = (data) => {
  let token = jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 5 * 60,
      data: data,
    },
    process.env.JWT_SECRET
  );
  let compressToken = generateCompressedToken(token);
  return compressToken.replace(/\//g, "_");
};

module.exports = {
  generateToken,
  generateTokenReset,
};
