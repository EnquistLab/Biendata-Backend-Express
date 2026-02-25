// routes/traitDownloadRoutes.js

const express = require('express');
const { downloadTraitsBySpecies } = require('../controllers/traitDownloadController');

const router = express.Router();

router.get('/traits', downloadTraitsBySpecies);

module.exports = router;
