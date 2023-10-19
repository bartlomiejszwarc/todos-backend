require("dotenv").config();
const express = require("express");
const router = express.Router();
const {
	getUsersByKeyword,
	sendFriendsInvitation,
} = require("../controllers/userController");

router.get("/:keyword", getUsersByKeyword);
router.post("/invite", sendFriendsInvitation);

module.exports = router;
