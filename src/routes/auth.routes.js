const express = require("express");
const router = express.Router();

//importing of controller
const { registerUser, loginUser, logout, resetPassword, forgetPasswordEmail, forgetPassword } = require("../controllers/auth.controller.js")

//importing middlewares
const { verifyLoggedInUser } = require("../middlewares/auth.middleware.js");
 
//auth routes defined
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').post(logout);
router.route('/reset-password').post(verifyLoggedInUser, resetPassword);
router.route('/forget-password-email').post(forgetPasswordEmail);
router.route('/forget-password').post(forgetPassword);

module.exports = router;