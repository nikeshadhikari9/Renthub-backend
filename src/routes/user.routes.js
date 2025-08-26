const express = require("express");
const router = express.Router();

const { updateUserLocation } = require("../controllers/tenants.controller.js")
const { verifyLoggedInUser } = require("../middlewares/auth.middleware.js")

router.route('/update-location/:lat/:lng').post(verifyLoggedInUser, updateUserLocation);


module.exports = router;