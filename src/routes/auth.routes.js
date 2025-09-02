const express = require("express");
const router = express.Router();

//importing of controller
const { registerUser, loginUser, logout, resetPassword, forgetPasswordEmail, forgetPassword, myDetails } = require("../controllers/auth.controller.js")

//importing middlewares
const { verifyLoggedInUser, redirectLoggedInUser } = require("../middlewares/auth.middleware.js");

//auth routes defined
router.route('/register').post(redirectLoggedInUser, registerUser);
router.route('/login').post(redirectLoggedInUser, loginUser);
router.route('/me').get(redirectLoggedInUser, myDetails);
router.route('/logout').post(verifyLoggedInUser, logout);
router.route('/reset-password').post(verifyLoggedInUser, resetPassword);
router.route('/forget-password-email').post(forgetPasswordEmail);
router.route('/forget-password').post(forgetPassword);

module.exports = router;