const User = require("../models/userModel");
const FriendsRequest = require("../models/friendsRequestModel");

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
				},
			},
			{ new: true }
		);
		user.save();
		res.status(200).json({ message: "User's details updated.", user: user });
	} catch (e) {
		res.status(400).json({ message: e });
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
module.exports = {
	getUsersByKeyword,
	sendFriendsInvitation,
	getFriendsRequests,
	getUserDetails,
	acceptFriendsRequest,
	declineFriendsRequest,
	updateUserDetails,
};
