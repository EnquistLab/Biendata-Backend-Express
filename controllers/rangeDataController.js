const pool = require('../config/db');

const getRangeData = async (req, res) => {
    const { species } = req.query;

    if (!species) {
        return res.status(400).json({ error: 'Species name is required' });
    }

    try {
        const client = await pool.connect();

        // Define the SQL query
        const query = `
            SELECT range_id, range_name, species_id, species, rangetype_id, source_id, source_name, run_id, run, 
                   batch_id, model_id, model, statistics_unique_id, base_model, mod_type, model_moment, sampling, 
                   scenario_id, scenario, scenario_filecode, time_period, climate_model, rcp, threshold_id, threshold, 
                   background, is_default, basename, rel_path, ST_AsText(geom2)
            FROM ranges.range
            WHERE species = $1
              AND scenario = 'present'
              AND is_default = 1;
        `;

        const result = await client.query(query, [species]);
        client.release();

        if (result.rows.length === 0) {
            return res.status(404).json({ message: `No data found for species ${species}` });
        }

        // Return the data in JSON format
        return res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error fetching range data:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

module.exports = { getRangeData };
