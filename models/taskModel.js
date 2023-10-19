const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const taskSchema = new Schema({
	text: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: false,
	},
	deadline: {
		type: Date,
		required: false,
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
	priority: {
		type: Number,
		required: false,
		default: 4,
	},
});

module.exports = mongoose.model("Task", taskSchema);
