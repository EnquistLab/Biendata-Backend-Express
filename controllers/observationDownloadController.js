// controllers/observationDownloadController.js

const pool = require('../config/db');

// In-memory cache (for demonstration; consider using Redis for production)
const cache = new Map();

const downloadObservationsBySpecies = async (req, res, next) => {
    const { species } = req.query;

    if (!species) {
        return res.status(400).json({ error: 'Species name is required' });
    }

    const formattedSpecies = species.replace(/_/g, ' ');

    // Check cache first
    if (cache.has(formattedSpecies)) {
        console.log(`Serving ${formattedSpecies} from cache`);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${formattedSpecies}_observations.csv"`);
        res.status(200).send(cache.get(formattedSpecies));
        return;
    }

    try {
        const client = await pool.connect();

        // Query to fetch observations for the given species
        const query = `
            SELECT taxonobservation_id, observation_type, datasource, scrubbed_species_binomial, latitude, longitude
            FROM analytical_db.view_full_occurrence_individual
            WHERE scrubbed_species_binomial = $1;
        `;

        const result = await client.query(query, [formattedSpecies]);
        client.release();

        if (result.rows.length === 0) {
            return res.status(404).json({ message: `No observations available for species ${formattedSpecies}` });
        }

        // Prepare CSV headers and data
        const headers = Object.keys(result.rows[0]);
        let csv = headers.join(',') + '\n';
        result.rows.forEach(row => {
            const values = headers.map(header => {
                let value = row[header];
                if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
                    value = `"${value.replace(/"/g, '""')}"`; // Escape special characters
                }
                return value;
            });
            csv += values.join(',') + '\n';
        });

        // Cache the result
        cache.set(formattedSpecies, csv);
       // console.log(`Cached CSV for ${formattedSpecies}`);

        // Stream CSV response to client
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${formattedSpecies}_observations.csv"`);
        res.status(200).send(csv);

    } catch (error) {
        console.error('Error fetching observations:', error);
        next(error); // Pass the error to custom error handling middleware
    }
};

module.exports = { downloadObservationsBySpecies };
