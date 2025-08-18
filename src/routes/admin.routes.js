const express = require("express");
const router = express.Router();

//import controllers
const { loginAdmin, logout, resetPassword, forgetPasswordEmail, forgetPassword } = require("../controllers/auth.controller.js")

//import middlewares to verify admin
const { verifyAdmin } = require("../middlewares/auth.middleware.js");

router.post('/login', loginAdmin);
router.post('/logout', logout)
router.route('/reset-password').post(verifyAdmin, resetPassword);
router.route('/forget-password-email').post(forgetPasswordEmail);
router.route('/forget-password').post(forgetPassword);

module.exports = router;