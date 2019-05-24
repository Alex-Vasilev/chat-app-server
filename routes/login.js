const express = require("express");
const router = express.Router();

router.route("/").post((req, res, next) => {
  res.send(req.body);
});

module.exports = router;