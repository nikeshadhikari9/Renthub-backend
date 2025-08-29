const express = require("express");
const router = express.Router();

const { verifyLoggedInUser } = require("../middlewares/auth.middleware.js")
const { paymentStatus } = require("../controllers/transaction.controller.js")

// route to verify payment of esewa
router.route('/esewa/payment-status').post(verifyLoggedInUser, paymentStatus);

module.exports = router;