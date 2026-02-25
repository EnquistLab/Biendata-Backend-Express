const express = require('express');
const { getMultipleSpecies } = require('../controllers/multiSpeciesLookupHandler');

const router = express.Router();

// POST route for multiple species search
router.post('/', getMultipleSpecies);

module.exports = router;
