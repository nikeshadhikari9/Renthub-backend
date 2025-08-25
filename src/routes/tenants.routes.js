const express = require("express");
const router = express.Router();

const { loginAdmin, logout } = require("../controllers/auth.controller.js")

router.post('/login', loginAdmin);
router.post('/logout', logout)

module.exports = router;