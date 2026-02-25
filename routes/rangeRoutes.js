// routes/rangeRoutes.js

const express = require('express');
const { getRangeBySpecies } = require('../controllers/rangeController');

const router = express.Router();

router.post('/', getRangeBySpecies);

module.exports = router;
