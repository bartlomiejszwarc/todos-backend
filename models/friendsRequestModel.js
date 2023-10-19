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
			unique: false,
		},
	],
	pendingRequests: [
		{
			type: Schema.Types.ObjectId,
			required: true,
			unique: false,
		},
	],
});

module.exports = mongoose.model("FriendsRequest", friendsRequestSchema);
