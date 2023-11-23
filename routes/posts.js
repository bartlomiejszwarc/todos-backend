require("dotenv").config();
const express = require("express");
const router = express.Router();
const {
	createPost,
	getFriendsPosts,
	deletePost,
	editPost,
} = require("../controllers/postController");

router.post("/create", createPost);
router.delete("/:id", deletePost);
router.get("/:id", getFriendsPosts);

module.exports = router;
