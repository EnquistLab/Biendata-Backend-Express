// routes/observationDownloadRoutes.js

const express = require('express');
const { downloadObservationsBySpecies } = require('../controllers/observationDownloadController');

const router = express.Router();

router.get('/observations', downloadObservationsBySpecies);

module.exports = router;
