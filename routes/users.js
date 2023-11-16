require("dotenv").config();
const express = require("express");
const router = express.Router();
const {
	getUsersByKeyword,
	sendFriendsInvitation,
	getFriendsRequests,
	getUserDetails,
	acceptFriendsRequest,
	declineFriendsRequest,
	updateUserDetails,
	deleteUser,
} = require("../controllers/userController");

router.get("/:keyword", getUsersByKeyword);
router.get("/requests/:id", getFriendsRequests);
router.get("/details/:id", getUserDetails);
router.post("/invite", sendFriendsInvitation);
router.post("/requests/accept", acceptFriendsRequest);
router.post("/requests/decline", declineFriendsRequest);
router.put("/details", updateUserDetails);

router.delete("/:id", deleteUser);

module.exports = router;
