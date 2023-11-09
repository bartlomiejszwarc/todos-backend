const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const tasksRoutes = require("./routes/tasks");
const usersRoutes = require("./routes/users");
const postsRoutes = require("./routes/posts");

const app = express();
app.use(express.json());
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);
app.use(bodyParser.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/posts", postsRoutes);

mongoose
	.connect(process.env.MONGO_URL, {
		useNewUrlParser: true,
	})
	.then(() => {
		app.listen(process.env.PORT, () => {
			console.log("Connected to MongoDB. Listening on port", process.env.PORT);
		});
	})
	.catch((error) => {
		console.log(error);
	});
