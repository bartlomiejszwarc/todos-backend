const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createToken = (_id) => {
	return jwt.sign({ _id: _id }, process.env.SECRET, { expiresIn: "1d" });
};

const login = async (req, res, next) => {
	try {
		const { username, password } = req.body;
		if (!username || !password) throw Error("All fields are required");

		const user = await User.findOne({ username: username });
		if (!user) throw Error("User not found.");

		const checkPassword = await bcrypt.compare(password, user.password);
		if (!checkPassword) throw Error("Password is incorrect.");
		const token = createToken(user._id);

		return res.status(200).json({
			message: "Login successful.",
			token: token,
			username: user.username,
			displayName: user.displayName,
			id: user._id,
		});
	} catch (e) {
		return res.status(401).json({ message: e.message });
	}
};

const register = async (req, res) => {
	try {
		const { username, password, displayName } = req.body;
		if (!username || !password || !displayName) {
			throw Error("All fields are required");
		}
		const exists = await User.findOne({ username: req.body.username });
		if (exists) {
			throw Error("Username already is use");
		}
		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(password, salt);
		await User.create({
			username: username,
			password: hash,
			displayName: displayName,
		});
		return res.json({ status: 201, message: "User created successfully." });
	} catch (e) {
		return res.json({ status: 400, error: e.message });
	}
};

module.exports = { login, register };
