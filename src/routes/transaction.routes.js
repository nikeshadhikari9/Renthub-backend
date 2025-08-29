const express = require("express");
const router = express.Router();

const { paymentStatus } = require("../controllers/transaction.controller.js")

// route to verify payment of esewa
router.route('/esewa/payment-status').post(paymentStatus);

module.exports = router;