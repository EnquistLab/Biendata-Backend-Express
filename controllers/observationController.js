// controllers/observationController.js

const pool = require('../config/db');

const getObservationsBySpecies = async (req, res, next) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests allowed' });
    }

    let { species } = req.body;

    if (!species) {
        return res.status(400).json({ error: 'Species name is required' });
    }

    // Format the species name by replacing spaces with underscores
    species = species.replace(/\s+/g, '_');

    try {
        // Query to fetch observations based on the provided species
        const query = `
            SELECT gid, species, ST_AsGeoJSON(geom, 4326) as geojson_geom
            FROM ranges.observations_union
            WHERE species = $1
        `;

        const result = await pool.query(query, [species]); // Pass the species as a parameter
        res.status(200).json(result.rows); // Return the data as JSON with GeoJSON geometry
    } catch (error) {
        console.error('Error fetching observations:', error);
        next(error); // Pass error to the custom error handler
    }
};

module.exports = { getObservationsBySpecies };
