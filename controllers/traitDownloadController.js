// controllers/traitDownloadController.js

const pool = require('../config/db');

// In-memory cache (for demonstration; consider using Redis for production)
const cache = new Map();

const downloadTraitsBySpecies = async (req, res, next) => {
    const { species } = req.query;

    if (!species) {
        return res.status(400).json({ error: 'Species name is required' });
    }

    const formattedSpecies = species.replace(/_/g, ' ');

    // Check cache first
    if (cache.has(formattedSpecies)) {
        console.log(`Serving cached data for ${formattedSpecies}`);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${formattedSpecies}_traits.csv"`);
        return res.status(200).send(cache.get(formattedSpecies));
    }

    try {
        const client = await pool.connect();

        // SQL query to fetch trait data for the specified species
        const query = `
            SELECT 
                id AS trait_id, 
                scrubbed_family, 
                scrubbed_species_binomial,
                trait_name, 
                trait_value, 
                unit, 
                method,
                latitude, 
                longitude, 
                elevation_m,
                url_source,
                project_pi, 
                project_pi_contact,
                access
            FROM analytical_db.agg_traits
            WHERE scrubbed_species_binomial = $1
        `;

        const result = await client.query(query, [formattedSpecies]);
        client.release();

        if (result.rows.length === 0) {
            return res.status(404).json({ message: `No traits available for species ${formattedSpecies}` });
        }

        // Generate CSV content
        const headers = Object.keys(result.rows[0]);
        let csv = headers.join(',') + '\n';
        result.rows.forEach(row => {
            const values = headers.map(header => {
                let value = row[header];
                if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
                    value = `"${value.replace(/"/g, '""')}"`; // Escape double quotes
                }
                return value;
            });
            csv += values.join(',') + '\n';
        });

        // Cache the CSV data
        cache.set(formattedSpecies, csv);
       // console.log(`Cached CSV data for ${formattedSpecies}`);

        // Stream CSV to the client
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${formattedSpecies}_traits.csv"`);
        res.status(200).send(csv);

    } catch (error) {
        console.error('Error fetching traits:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

module.exports = { downloadTraitsBySpecies };
