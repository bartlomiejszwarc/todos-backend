require("dotenv").config();
const express = require("express");
const router = express.Router();
const checkAuth = require("./../middlewares/checkAuth");

const {
	login,
	register,
	checkIfAuthenticated,
} = require("../controllers/authController");

router.post("/login", login);
router.post("/register", register);
router.get("/me", checkAuth, checkIfAuthenticated);

module.exports = router;
