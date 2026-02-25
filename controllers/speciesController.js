// controllers/speciesController.js
const pool = require('../config/db');

const getSpecies = async (req, res, next) => {
    const keyword = req.query.keyword || '';
    const searchMode = req.query.mode || 'Exact';

    if (!keyword) {
        return res.status(400).json({ message: 'Keyword query parameter is required' });
    }

    try {
        const query = `
      SELECT species
      FROM ranges.species
      WHERE species ILIKE $1
      ORDER BY species
      LIMIT 100;
    `;
        const searchString = searchMode === 'Fuzzy' ? `%${keyword}%` : `${keyword}%`;
        const result = await pool.query(query, [searchString]);
        res.status(200).json(result.rows);
    } catch (error) {
        next(error); // Pass error to custom error handler
    }
};

module.exports = { getSpecies };
