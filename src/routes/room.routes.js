const express = require("express");
const router = express.Router();

//importing middlewares
const upload = require("../middlewares/multer.middleware.js");
const { verifyLandlord } = require("../middlewares/auth.middleware.js")

//importing controllers
const { addRoom, updateRoom, deleteRoom } = require("../controllers/room.controller.js")

//room routes
router.route('/add-room').post(verifyLandlord, upload.array('images'), addRoom);
router.route('/update-room').patch(verifyLandlord, upload.array('images'), updateRoom);
router.route('/delete-room/:roomId').patch(verifyLandlord, upload.array('images'), deleteRoom);

module.exports = router;