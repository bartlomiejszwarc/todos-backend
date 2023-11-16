const Post = require("../models/postModel");
const Friends = require("../models/friendsRequestModel");

const getFriendsPosts = async (req, res, next) => {
	try {
		if (!req?.params?.id) {
			throw Error("Cannot fetch posts. Need user ID.");
		}
		const friends = await Friends.find({ ownerId: req.params.id }).select({
			friends: 1,
			_id: 0,
		});
		const friendsIds = friends.map((friends) => friends.friends);
		const userPosts = await Post.find({ owner: req.params.id }).sort("-date");

		const friendsPosts = await Post.find({
			owner: { $in: friendsIds[0] },
		}).sort("-date");

		res.status(200).json({
			message: "Posts fetched successfully.",
			userPosts: userPosts,
			friendsPosts: friendsPosts,
		});
	} catch (e) {
		res.status(400).json({ message: e.message });
	}
};

const createPost = async (req, res, next) => {
	try {
		if (!req?.body?.text) {
			throw Error("Post must contain a text.");
		}
		if (!req?.body?.owner) {
			throw Error("Post must have the owner.");
		}
		const post = await Post.create({
			text: req?.body?.text,
			owner: req?.body?.owner,
		});
		res.status(200).json({ message: "Post created successfully.", post: post });
	} catch (e) {
		res.status(400).json({ message: e.message });
	}
};

const deletePost = async (req, res, next) => {
	try {
		if (!req?.params?.id) {
			throw Error("Post ID must be provided");
		}
		const post = await Post.findByIdAndDelete(req.params.id);
		if (!post) throw Error("Post not found");

		res.status(200).json({ message: "Post deleted successfully." });
	} catch (e) {
		res.status(400).json({ message: e.message });
	}
};

module.exports = { getFriendsPosts, createPost, deletePost };
