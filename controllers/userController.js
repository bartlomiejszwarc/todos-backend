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
			.select("username");
		res.status(200).json({
			message:
				"Fetched list of users that contains keyword " + req.params.keyword,
			users: users,
		});
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
module.exports = { getUsersByKeyword, sendFriendsInvitation };
