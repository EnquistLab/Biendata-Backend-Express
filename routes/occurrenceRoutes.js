const express = require('express');
const { getOccurrenceRecords } = require('../controllers/occurrenceController');

const router = express.Router();

// Define the route to fetch occurrence records
router.get('/records', getOccurrenceRecords);

module.exports = router;
