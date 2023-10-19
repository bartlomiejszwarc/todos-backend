const User = require("../models/userModel");

const getUsersByKeyword = async (req, res) => {
	try {
		if (req?.params?.keyword?.length < 3) {
			console.log("Haloo");
			throw Error("Type at least 3 characters");
		}
		const users = await User.find({
			displayName: { $regex: req.params.keyword, $options: "i" },
		})
			.select("displayName")
			.select("username");
		res.status(200).json({
			message:
				"Fetched list of users that contains keyword " + req.params.keyword,
			users: users,
		});
	} catch (e) {
		res.status(400).json({ message: e });
	}
};
module.exports = { getUsersByKeyword };
