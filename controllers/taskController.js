const Task = require("../models/taskModel");

const getUserTasks = async (req, res, next) => {
	try {
		if (!req?.params?.id) {
			throw Error("Cannot fetch tasks. Need user ID.");
		}
		const tasks = await Task.find({ owner: req?.params?.id }).sort({
			date: 1,
		});
		res
			.status(200)
			.json({ message: "Tasks fetched successfully.", tasks: tasks });
	} catch (e) {
		res.status(400).json({ message: e.message });
	}
};

const createTask = async (req, res, next) => {
	try {
		if (!req?.body?.text) {
			throw Error("Task must contain a text.");
		}
		if (!req?.body?.owner) {
			throw Error("Task must have the owner.");
		}
		const task = await Task.create({
			text: req?.body?.text,
			deadline: req?.body?.deadline,
			owner: req?.body?.owner,
			priority: req?.body?.priority,
			description: req?.body?.description,
		});
		res.status(200).json({ message: "Task created successfully.", task: task });
	} catch (e) {
		res.status(400).json({ message: e.message });
	}
};

const editTask = async (req, res, next) => {
	try {
		if (!req?.body?._id) throw Error("Task ID must be provided");
		const task = await Task.findByIdAndUpdate(
			req.body._id,
			{
				text: req.body?.text,
				description: req.body.description,
				deadline: req.body?.deadline,
				priority: req?.body?.priority,
			},
			{ new: true }
		);
		task.save();
		res.status(200).json({ message: "Task updated", task: task });
	} catch (e) {
		res.status(400).json({ message: e.message });
	}
};

const deleteTask = async (req, res, next) => {
	try {
		if (!req?.params?.id) {
			throw Error("Cannot delete task.");
		}
		const task = await Task.findByIdAndDelete(req?.params?.id);
		res.status(200).json({ message: "Task deleted successfully.", task: task });
	} catch (e) {
		res.status(400).json({ message: e.message });
	}
};
module.exports = { getUserTasks, createTask, deleteTask, editTask };
