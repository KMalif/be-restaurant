const express = require("express");
const cors = require("cors");
const app = express();
const routes = require("./routes/index.js");
const PORT = 3000;
const path = require("path");
const midtransClient = require("midtrans-client");

require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});
app.use((req, res, next) => {
  req.snap = snap;
  next();
});

app.use("/api", routes);

app.all("*", (req, res) => {
  res.status(404).json({ message: "API Not Found" });
});

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
