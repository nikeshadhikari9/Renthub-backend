const express = require("express");
const router = express.Router();

const { esewaInitiatePayment, paymentStatus } = require("../controllers/transaction.controller.js")
const { verifyLoggedInUser } = require("../middlewares/auth.middleware.js")

router.route('/initiate-payment').post(verifyLoggedInUser, esewaInitiatePayment);
router.route('/payment-status').post(verifyLoggedInUser, paymentStatus);

module.exports = router;