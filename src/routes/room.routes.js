const express = require("express");
const router = express.Router();

//importing middlewares
const upload = require("../middlewares/multer.middleware.js");
const { verifyLandlord } = require("../middlewares/auth.middleware.js")

//importing controllers
const { addRoom } = require("../controllers/room.controller.js")

//room routes
router.route('/add-room').post(verifyLandlord, upload.array('images'), addRoom);

module.exports = router;