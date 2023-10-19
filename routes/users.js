require("dotenv").config();
const express = require("express");
const router = express.Router();
const { getUsersByKeyword } = require("../controllers/userController");

router.get("/:keyword", getUsersByKeyword);

module.exports = router;
