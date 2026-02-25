// routes/rangeDownloadRoutes.js

const express = require('express');
const { downloadRangeShapefile } = require('../controllers/rangeDownloadController');

const router = express.Router();

router.get('/range', downloadRangeShapefile);

module.exports = router;
