// routes/multiObservationDownloadRoutes.js
const express = require('express');
const { downloadMultipleObservations } = require('../controllers/multiObservationDownloadController');
const router = express.Router();

router.post('/multiple-observations', downloadMultipleObservations);

module.exports = router;
