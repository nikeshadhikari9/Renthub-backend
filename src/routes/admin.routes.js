const express = require("express");
const router = express.Router();

//import controllers
const { loginAdmin, logout, resetPassword, forgetPasswordEmail, forgetPassword } = require("../controllers/auth.controller.js")
const { addAdvertisement, getALLAdmins, getAllLandlords, getAllRooms, getAllAdvertisements, getAllTenants, getFilteredRooms, updateAdvertisement, deleteAdvertisement, getFilteredUsers } = require("../controllers/admin.controller.js")
//import middlewares to verify admin
const { verifyAdmin } = require("../middlewares/auth.middleware.js");
const upload = require("../middlewares/multer.middleware.js");


router.post('/login', loginAdmin);
router.post('/logout', logout)
router.route('/reset-password').patch(verifyAdmin, resetPassword);
router.route('/forget-password-email').post(forgetPasswordEmail);
router.route('/forget-password').post(forgetPassword);
router.route('/create-advertisement').post(verifyAdmin, upload.single('adImage'), addAdvertisement);
router.route('/update-advertisement').patch(verifyAdmin, upload.single('adImage'), updateAdvertisement);
router.route('/get-admins').get(verifyAdmin, getALLAdmins);
router.route('/get-landlords').get(verifyAdmin, getAllLandlords);
router.route('/delete-advertisement').delete(verifyAdmin, deleteAdvertisement);
router.route('/get-rooms').delete(verifyAdmin, getAllRooms);
router.route('/get-advertisements').get(verifyAdmin, getAllAdvertisements);
router.route('/get-tenants').get(verifyAdmin, getAllTenants)
router.route('/get-filtered-rooms').get(verifyAdmin, getFilteredRooms)
router.route('/get-filtered-users').get(verifyAdmin, getFilteredUsers)

module.exports = router;