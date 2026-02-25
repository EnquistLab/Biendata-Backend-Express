const pool = require('../config/db'); // Adjust path as needed

/**
 * POST /api/multiple-observations
 * Expects JSON body: { "speciesList": ["speciesOne", "speciesTwo", ...] }
 */
const getMultipleObservations = async (req, res, next) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests allowed' });
    }

    let { speciesList } = req.body;
    if (!Array.isArray(speciesList) || speciesList.length === 0) {
        return res.status(400).json({ error: 'speciesList must be a non-empty array' });
    }

    // Replace spaces with underscores if that's your naming convention
    speciesList = speciesList.map(s => s.replace(/\s+/g, '_'));

    try {
        // Use ANY($1) to match all species in the array
        const query = `
  SELECT 
    gid, 
    species, 
    ST_AsGeoJSON(geom, 4326) AS geojson_geom
  FROM ranges.observations_union
  WHERE species = ANY($1)
`;


        const result = await pool.query(query, [speciesList]);
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching observations:', error);
        next(error);
    }
};

module.exports = {
    getMultipleObservations
};
