const jwt = require("jsonwebtoken");
const { handleClientError, handleServerError } = require("../helpers/handleError");

const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
      return handleClientError(res, 401, "No token provided");
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        return handleClientError(res, 403, "Token Expired");
      }

      if (decodedToken.data.role !== 1) {
        return handleClientError(res, 403, "Access Denied: Not an Admin");
      }

      req.user = decodedToken;
      next();
    });
  } catch (error) {
    return handleServerError(res);
  }
};

module.exports = {
  authenticateAdmin,
};
