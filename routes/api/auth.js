const express = require("express");
const router = express.Router();

// @route    GET api/auth/test
// @desc     tests authentication route
// @access   public route
router.get("/test", (req, res) =>
  res.json({ mesg: "User Authentication works" })
);

module.exports = router;
