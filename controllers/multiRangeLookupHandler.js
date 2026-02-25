const pool = require('../config/db'); // Adjust path as needed
const wkx = require('wkx');

/**
 * POST /api/multiple-ranges
 * Expects JSON body: { "speciesList": ["speciesOne", "speciesTwo", ...] }
 */
const getMultipleRanges = async (req, res, next) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests allowed' });
    }

    let { speciesList } = req.body;
    if (!Array.isArray(speciesList) || speciesList.length === 0) {
        return res.status(400).json({ error: 'speciesList must be a non-empty array' });
    }

    // Replace spaces with underscores if needed
    speciesList = speciesList.map(s => s.replace(/\s+/g, '_'));

    try {
        const query = `
            SELECT species,
                   ST_AsText(
                       ST_Simplify(
                           ST_MakeValid(
                               ST_Transform(geom, 4326)
                           ), 
                           0.001 
                       )
                   ) AS wkt_geom
            FROM ranges.range
            WHERE species = ANY($1);
        `;
        const result = await pool.query(query, [speciesList]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No range data available for the requested species' });
        }

        // Convert each row's geometry to GeoJSON
        const data = result.rows.map(row => {
            const geoJson = wkx.Geometry
                .parse(row.wkt_geom)
                .toGeoJSON();

            return {
                species: row.species,
                range: geoJson
            };
        });

        return res.status(200).json(data);
    } catch (error) {
        console.error('Database query error:', error);
        next(error);
    }
};

module.exports = {
    getMultipleRanges
};
