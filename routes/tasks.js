require("dotenv").config();
const express = require("express");
const router = express.Router();
const {
	getUserTasks,
	createTask,
	deleteTask,
	editTask,
} = require("../controllers/taskController");

router.get("/:id", getUserTasks);
router.post("/create", createTask);
router.delete("/:id", deleteTask);
router.put("/", editTask);

module.exports = router;
