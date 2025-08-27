const express = require("express");
const router = express.Router();

const upload = require("../middlewares/multer.middleware.js");

const { updateUserLocation } = require("../controllers/tenants.controller.js")
const { verifyLoggedInUser } = require("../middlewares/auth.middleware.js")
const { getUserDetails, updateUser } = require("../controllers/user.controller.js");

router.route('/update-location/:lat/:lng').post(verifyLoggedInUser, updateUserLocation);
router.route('/:id').get(verifyLoggedInUser, getUserDetails);
router.route('/update-user').patch(verifyLoggedInUser, upload.single("profileImage"), updateUser);


module.exports = router;