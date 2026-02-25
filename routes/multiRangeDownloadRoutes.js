// routes/multiRangeDownloadRoutes.js
const express = require('express');
const { downloadMultipleRanges } = require('../controllers/multiRangeDownloadController');
const router = express.Router();

router.post('/multiple-ranges', downloadMultipleRanges);

module.exports = router;
