const User = require("../models/userModel");
const FriendsRequest = require("../models/friendsRequestModel");
const bcrypt = require("bcrypt");

const getUsersByKeyword = async (req, res) => {
	try {
		if (req?.params?.keyword?.length < 3) {
			throw Error("Type at least 3 characters");
		}
		const users = await User.find({
			displayName: { $regex: req.params.keyword, $options: "i" },
		})
			.select("displayName")
			.select("username")
			.select("profileImage")
			.select("pendingRequests")
			.select("incomingRequests");
		res.status(200).json({
			message:
				"Fetched list of users that contains keyword " + req.params.keyword,
			users: users,
		});
	} catch (e) {
		res.status(400).json({ message: e.message });
	}
};

const getUserDetails = async (req, res) => {
	try {
		if (!req?.params?.id) throw Error("User ID must be provided");
		const user = await User.findById(req.params.id);
		res.status(200).json({
			message: "User's details fetched",
			user: {
				_id: user._id,
				username: user.username,
				displayName: user.displayName,
				email: user.showEmail ? user.email : null,
				phoneNumber: user.showPhoneNumber ? user.phoneNumber : null,
				country: user.country,
				city: user.city,
				profileImage: user.profileImage,
			},
		});
	} catch (e) {
		res.status(400).json({ message: e });
	}
};

const updateUserDetails = async (req, res) => {
	try {
		if (!req.query.userId) throw Error("User ID must be provided");

		const user = await User.findOneAndUpdate(
			{ _id: req.query.userId },
			{
				$set: {
					displayName: req.body.displayName,
					phoneNumber: req.body.phoneNumber,
					email: req.body.email,
					showPhoneNumber: req.body.showPhoneNumber,
					showEmail: req.body.showEmail,
					country: req.body.country,
					city: req.body.city,
				},
			},
			{ new: true }
		);
		res.status(200).json({ message: "User's details updated.", user: user });
	} catch (e) {
		res.status(400).json({ message: e.message });
	}
};

const updateUserProfileImage = async (req, res) => {
	try {
		if (!req.query.userId) throw Error("User ID must be provided");
		if (!req.file) throw "File not provided";
		const base64Image =
			"data:" +
			req?.file?.mimetype +
			";base64," +
			req?.file?.buffer?.toString("base64");
		const user = await User.findOneAndUpdate(
			{ _id: req.query.userId },
			{
				$set: {
					profileImage: base64Image,
				},
			},
			{ new: true }
		);
		res
			.status(200)
			.json({ message: "User's profile image updated.", user: user });
	} catch (e) {
		res.status(400).json({ message: e.message });
	}
};
const changeUserPassword = async (req, res) => {
	try {
		if (!req.query.userId) throw Error("User ID must be provided");
		if (!req?.body?.password) throw Error("Password must be provided");
		if (!req?.body?.repeatedPassword)
			throw Error("Repeated password must be provided");
		const password = req.body?.password;
		const repeatedPassword = req.body?.repeatedPassword;
		if (password !== repeatedPassword) throw Error("Passwords do not match");
		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(password, salt);
		const user = await User.findByIdAndUpdate(req.query.userId, {
			password: hash,
		});
		user.save();
		res.status(200).json({ message: "Password updated successfully" });
	} catch (e) {
		res.status(400).json({ message: e.message });
	}
};

const deleteUser = async (req, res) => {
	try {
		if (!req.params.id) throw Error("User ID must be provided");
		const user = await User.findByIdAndDelete(req.params.id);
		if (!user) throw Error("User not found");
		res.status(200).json({ message: "User deleted" });
	} catch (e) {
		res.status(400).json({ message: e.message });
	}
};

const getFriendsRequests = async (req, res) => {
	try {
		if (!req?.params?.id) throw Error("User ID must be provided");
		const userFriendsRequests = await FriendsRequest.findOne({
			ownerId: req.params.id,
		}).select("pendingRequests incomingRequests friends");

		res.status(200).json({
			message: "User's requests fetched",
			requests: userFriendsRequests,
		});
	} catch (e) {
		res.status(400).json({ message: e });
	}
};

const acceptFriendsRequest = async (req, res) => {
	try {
		if (!req?.body?.acceptedUserId || !req.body?.id)
			throw Error("User ID must be provided");
		const userRequests = await FriendsRequest.findOne({ ownerId: req.body.id });
		const acceptedUserRequests = await FriendsRequest.findOne({
			ownerId: req.body.acceptedUserId,
		});
		if (!userRequests) throw Error("Requests Model not found");
		if (!acceptedUserRequests) throw Error("Requests Model not found");
		await userRequests.updateOne(
			{
				$push: { friends: req.body.acceptedUserId },
				$pullAll: { incomingRequests: [req.body.acceptedUserId] },
			},
			{ new: true }
		);
		await acceptedUserRequests.updateOne({
			$push: { friends: req.body.id },
			$pullAll: { pendingRequests: [req.body.id] },
		});
		res
			.status(200)
			.json({ message: "User added to friends list", friends: userRequests });
	} catch (e) {
		res.status(400).json({ message: e });
	}
};

const declineFriendsRequest = async (req, res) => {
	try {
		if (!req?.body?.declinedUserId || !req.body?.id)
			throw Error("User ID must be provided");

		const userRequests = await FriendsRequest.findOne({
			ownerId: req.body.id,
		});
		const declinedUserRequests = await FriendsRequest.findOne({
			ownerId: req.body.declinedUserId,
		});
		if (!userRequests) throw Error("Requests Model not found");
		if (!declinedUserRequests) throw Error("Requests Model not found");
		await userRequests.updateOne(
			{
				$pullAll: { incomingRequests: [req.body.declinedUserId] },
			},
			{ new: true }
		);
		await declinedUserRequests.updateOne({
			$pullAll: { pendingRequests: [req.body.id] },
		});
		res
			.status(200)
			.json({ message: "User requests declined", friends: userRequests });
	} catch (e) {
		res.status(400).json({ message: e });
	}
};
const sendFriendsInvitation = async (req, res) => {
	try {
		if (!req.body.invitedUserId) throw Error("User ID must be provided");
		if (!req.body.sendByUserId) throw Error("Owner ID must be provided");
		const invitedUser = await User.findById(req.body.invitedUserId);
		if (!invitedUser) throw Error("User not found");

		var invitedUserFriendsRequest = await FriendsRequest.findOne({
			ownerId: req.body.invitedUserId,
		});
		if (!invitedUserFriendsRequest) {
			invitedUserFriendsRequest = await FriendsRequest.create({
				ownerId: req.body.invitedUserId,
			});
			await invitedUserFriendsRequest.save();
		}

		var sendByUserFriendsRequest = await FriendsRequest.findOne({
			ownerId: req.body.sendByUserId,
		});
		if (!sendByUserFriendsRequest) {
			sendByUserFriendsRequest = await FriendsRequest.create({
				ownerId: req.body.sendByUserId,
			});
			await sendByUserFriendsRequest.save();
		}

		const checkIfContainsId = await FriendsRequest.find({
			ownerId: req.body.invitedUserId,
			incomingRequests: { $in: req.body.sendByUserId },
		});

		if (checkIfContainsId.length === 0) {
			await invitedUserFriendsRequest.updateOne(
				{
					$push: { incomingRequests: req.body.sendByUserId },
				},
				{ new: true }
			);
			await invitedUserFriendsRequest.save();
			await sendByUserFriendsRequest.updateOne(
				{
					$push: { pendingRequests: req.body.invitedUserId },
				},
				{ new: true }
			);
			await sendByUserFriendsRequest.save();
		} else {
			await invitedUserFriendsRequest.updateOne(
				{
					$pullAll: { incomingRequests: [req.body.sendByUserId] },
				},
				{ new: true }
			);
			await invitedUserFriendsRequest.save();
			await sendByUserFriendsRequest.updateOne(
				{
					$pullAll: { pendingRequests: [req.body.invitedUserId] },
				},
				{ new: true }
			);
			await invitedUserFriendsRequest.save();
		}

		res.status(200).json({
			message: "Invitation sent",
			invitation: invitedUserFriendsRequest,
			request: sendByUserFriendsRequest,
		});
	} catch (e) {
		res.status(400).json({ message: e.message });
	}
};

const removeUserFromFriendsList = async (req, res) => {
	try {
		if (!req?.query?.userId) throw Error(" User ID must be provided");
		if (!req?.params?.id) throw Error(" User ID must be provided");
		const userFriends = await FriendsRequest.findOneAndUpdate(
			{
				ownerId: req.query.userId,
			},
			{ $pullAll: { friends: [req.params.id] } },
			{ new: true }
		);

		if (!userFriends) throw Error("Wrong ID");
		const removedUserFriends = await FriendsRequest.findOneAndUpdate(
			{
				ownerId: req?.params?.id,
			},
			{
				$pullAll: { friends: [req.query.userId] },
			},
			{ new: true }
		);
		if (!removedUserFriends) throw Error("Wrong ID");

		res.status(200).json({ message: "Friend removed", friends: userFriends });
	} catch (e) {
		res.status(400).json({ message: e.message });
	}
};
module.exports = {
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
	removeUserFromFriendsList,
};
