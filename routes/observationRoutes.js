// routes/observationRoutes.js

const express = require('express');
const { getObservationsBySpecies } = require('../controllers/observationController');

const router = express.Router();

router.post('/', getObservationsBySpecies);

module.exports = router;
