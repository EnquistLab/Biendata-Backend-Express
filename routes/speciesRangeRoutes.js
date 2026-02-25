const express = require('express');
const { getSpeciesRangeData } = require('../controllers/speciesRangeController');

const router = express.Router();

// Define the route to fetch species range data
router.get('/data', getSpeciesRangeData);

module.exports = router;
