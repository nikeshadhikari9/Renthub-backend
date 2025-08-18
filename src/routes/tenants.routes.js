const express = require("express");
const router = express.Router();

const { loginAdmin, logout } = require("../controllers/auth.Controller.js")

router.post('/login', loginAdmin);
router.post('/logout', logout)

module.exports = router;