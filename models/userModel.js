const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
	username: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	displayName: {
		type: String,
		required: false,
	},
	phoneNumber: {
		type: String,
		required: false,
	},
	email: {
		type: String,
		required: false,
	},
});

module.exports = mongoose.model("User", userSchema);
