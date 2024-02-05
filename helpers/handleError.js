const handleServerError = (res) => {
  return res.status(500).json({ message: "Internal Server Error" });
};

const handleClientError = (res, status, message) => {
  return res.status(status).json({ message });
};

module.exports = {
  handleServerError,
  handleClientError,
};
