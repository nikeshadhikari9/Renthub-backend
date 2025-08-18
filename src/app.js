const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan'); // For logging HTTP requests
const { CORS_ORIGIN } = require("../src/config/env");
const app = express();

app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json({ limit: '800kb' })); // Adjust limit if needed
app.use(express.urlencoded({ extended: true, limit: '200kb' }));
app.use(express.static('public')); // Serve static files
app.use(cookieParser()); // Parse cookies
app.use(morgan('dev')); // Log HTTP requests

// Error-handling middleware
app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).json({ message: err.message || 'Server error' });
});

module.exports = app;