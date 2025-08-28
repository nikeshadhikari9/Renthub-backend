const express = require("express");
const router = express.Router();

const { roomsByLandlord } = require("../controllers/landlord.controller.js")
const { verifyLandlord } = require("../middlewares/auth.middleware.js")

router.route('/my-rooms').get()


module.exports = router;