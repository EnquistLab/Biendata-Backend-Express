// controllers/rangeController.js

const pool = require('../config/db');
const wkx = require('wkx');

const getRangeBySpecies = async (req, res, next) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests allowed' });
    }

    let { species } = req.body;

    if (!species) {
        return res.status(400).json({ error: 'Species name is required' });
    }

    species = species.replace(/\s+/g, '_'); // Replace spaces with underscores

    try {
        const query = `
            SELECT species, ST_AsText(
                ST_Simplify(
                    ST_MakeValid(
                        ST_Transform(geom, 4326)
                    ), 
                    0.001  -- Tolerance value for simplification, adjust as needed
                )
            ) AS wkt_geom
            FROM ranges.range
            WHERE species = $1
            LIMIT 1;
        `;

        const result = await pool.query(query, [species]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: `No range data available for species ${species}` });
        }

        const { wkt_geom } = result.rows[0];

        // Parse WKT range data to GeoJSON format
        const range = wkx.Geometry.parse(wkt_geom).toGeoJSON();

        res.status(200).json({ species, range });
    } catch (error) {
        console.error('Database query error:', error);
        next(error); // Pass error to the custom error handler
    }
};

module.exports = { getRangeBySpecies };
