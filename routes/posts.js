require("dotenv").config();
const express = require("express");
const router = express.Router();
const {
	createPost,
	getFriendsPosts,
} = require("../controllers/postController");

router.post("/create", createPost);
router.get("/:id", getFriendsPosts);

module.exports = router;
