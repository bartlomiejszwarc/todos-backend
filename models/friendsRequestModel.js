const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const friendsRequestSchema = new Schema({
	ownerId: {
		type: Schema.Types.ObjectId,
		required: true,
	},
	incomingRequests: [
		{
			type: Schema.Types.ObjectId,
			required: true,
			unique: true,
		},
	],
	pendingRequests: [
		{
			type: Schema.Types.ObjectId,
			required: true,
			unique: true,
		},
	],
});

module.exports = mongoose.model("FriendsRequest", friendsRequestSchema);
