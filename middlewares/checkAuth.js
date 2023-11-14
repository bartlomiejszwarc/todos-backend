const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const checkAuth = async (req, res, next) => {
	try {
		if (!req.headers["authorization"]) throw Error("Token must be provided");
		const token = req.headers["authorization"].split(" ")[1];
		const decodedToken = jwt.verify(token, process.env.SECRET);
		if (!decodedToken) throw Error("User unauthorized.");
		if (decodedToken._id !== req.query.userId)
			throw Error("User unauthorized.");
		const user = await User.findById(decodedToken._id).select(
			"_id username email phoneNumber displayName showPhoneNumber showEmail"
		);
		req.user = user;
		next();
	} catch (e) {
		res.status(401).json({ message: e });
	}
};

module.exports = checkAuth;
