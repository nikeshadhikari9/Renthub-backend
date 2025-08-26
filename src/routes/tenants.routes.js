const express = require("express");
const router = express.Router();

const { updateUserLocation } = require("../controllers/tenants.controller.js")

router.post('/login', loginAdmin);
router.post('/logout', logout)

module.exports = router;