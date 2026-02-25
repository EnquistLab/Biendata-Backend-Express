// routes/traitRoutes.js

const express = require('express');
const { getTraitRecordsBySpecies, getTraitRecordsByTrait } = require('../controllers/traitController');

const router = express.Router();

// Route to fetch trait records by species name
router.get('/species', getTraitRecordsBySpecies);

// Route to fetch trait records by trait name
router.get('/trait', getTraitRecordsByTrait);

module.exports = router;
