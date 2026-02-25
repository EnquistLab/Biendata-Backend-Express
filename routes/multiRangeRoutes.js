const express = require('express');
const { getMultipleRanges } = require('../controllers/multiRangeLookupHandler');

const router = express.Router();

// POST route for multiple species ranges
router.post('/', getMultipleRanges);

module.exports = router;
