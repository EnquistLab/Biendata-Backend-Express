const express = require('express');
const { getMultipleObservations } = require('../controllers/multiObservationLookupHandler');

const router = express.Router();

// POST route for multiple species observations
router.post('/', getMultipleObservations);

module.exports = router;
