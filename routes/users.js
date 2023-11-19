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
	changeUserPassword,
	updateUserProfileImage,
} = require("../controllers/userController");

const multer = require("multer");

const upload = multer({});

router.get("/:keyword", getUsersByKeyword);
router.get("/requests/:id", getFriendsRequests);
router.get("/details/:id", getUserDetails);
router.post("/invite", sendFriendsInvitation);
router.post("/requests/accept", acceptFriendsRequest);
router.post("/requests/decline", declineFriendsRequest);
router.put("/details", updateUserDetails);
router.put("/password", changeUserPassword);
router.put("/profileimage", upload.single("file"), updateUserProfileImage);

router.delete("/:id", deleteUser);

module.exports = router;
