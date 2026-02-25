const express = require('express');
const { getRangeData } = require('../controllers/rangeDataController');

const router = express.Router();

router.get('/range-data', getRangeData);

module.exports = router;
