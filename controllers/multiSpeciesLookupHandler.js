const pool = require('../config/db'); // Adjust path as needed

/**
 * POST /api/multiple-species
 * Expects JSON body: { "speciesList": ["speciesOne", "speciesTwo", ...] }
 */
const getMultipleSpecies = async (req, res, next) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests allowed' });
    }

    const { speciesList } = req.body;
    if (!Array.isArray(speciesList) || speciesList.length === 0) {
        return res.status(400).json({ message: 'speciesList must be a non-empty array' });
    }

    try {
        // If you want partial/fuzzy matching, build up dynamic WHERE clauses or use ILIKE.
        // For exact matches:
        const query = `
            SELECT species
            FROM ranges.species
            WHERE species = ANY ($1)
            ORDER BY species
            LIMIT 100;
        `;

        // Convert array elements to underscores, if that’s your convention
        const formattedSpeciesList = speciesList.map(sp => sp.replace(/\s+/g, '_'));

        const result = await pool.query(query, [formattedSpeciesList]);
        return res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMultipleSpecies
};
