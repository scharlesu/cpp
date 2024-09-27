const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  req.t;
  res.render("index", { message: req.t("home") });
});

module.exports = router;
