const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema({
	text: {
		type: String,
		required: true,
	},
	date: {
		type: Date,
		required: true,
		default: Date.now(),
	},
	owner: {
		type: Schema.Types.ObjectId,
		required: true,
	},
});

module.exports = mongoose.model("Post", postSchema);
