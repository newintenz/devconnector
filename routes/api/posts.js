const express = require("express");
const router = express.Router();

// @route    GET api/posts/test
// @desc     tests posts route
// @access   public route
router.get("/test", (req, res) => res.json({ mesg: "POSTS works" }));

module.exports = router;
