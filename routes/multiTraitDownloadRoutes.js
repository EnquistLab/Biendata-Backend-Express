// routes/multiTraitDownloadRoutes.js
const express = require('express');
const { downloadMultipleTraits } = require('../controllers/multiTraitDownloadController');
const router = express.Router();

router.post('/multiple-traits', downloadMultipleTraits);

module.exports = router;
