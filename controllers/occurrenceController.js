const { Client } = require('pg');

const getOccurrenceRecords = async (req, res) => {
    const { species } = req.query;

    if (!species) {
        return res.status(400).json({ error: 'Species name is required' });
    }

    const client = new Client({
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        database: process.env.PGDATABASE2,
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT || 5432,
    });

    try {
        await client.connect();

        const query = `
            SELECT 
                scrubbed_species_binomial, verbatim_family, verbatim_scientific_name,
                family_matched, name_matched, name_matched_author, higher_plant_group,
                scrubbed_taxonomic_status, scrubbed_family, scrubbed_author, native_status,
                native_status_reason, native_status_sources, is_introduced, native_status_country,
                native_status_state_province, native_status_county_parish, country,
                state_province, county, locality, elevation_m, latitude, longitude,
                date_collected, datasource, dataset, dataowner, custodial_institution_codes,
                collection_code, view_full_occurrence_individual.datasource_id, catalog_number,
                recorded_by, record_number, date_collected, identified_by, date_identified,
                identification_remarks, is_cultivated_observation, is_cultivated_in_region,
                is_location_cultivated, observation_type
            FROM view_full_occurrence_individual
            WHERE scrubbed_species_binomial = $1
              AND is_geovalid = 1
              AND higher_plant_group NOT IN ('Algae', 'Bacteria', 'Fungi')
              AND (georef_protocol IS NULL OR georef_protocol <> 'county centroid')
              AND (is_centroid IS NULL OR is_centroid = 0)
              AND scrubbed_species_binomial IS NOT NULL;
        `;

        const result = await client.query(query, [species.trim()]);

        await client.end();

        if (result.rows.length === 0) {
            return res.status(404).json({ message: `No data found for species ${species}` });
        }

        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error('Error fetching occurrence records:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

module.exports = { getOccurrenceRecords };
