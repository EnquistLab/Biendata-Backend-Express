const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { getMultipleOccurrenceRecords } = require('../controllers/multiOccurrenceController');

// Define rate limiter specific to this route
const routeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 10 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again after 10 minutes.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiter to the route
router.get('/', routeLimiter, getMultipleOccurrenceRecords);

module.exports = router;
