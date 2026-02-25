// controllers/traitController.js

const { Client } = require('pg');

const getTraitRecordsBySpecies = async (req, res) => {
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
        scrubbed_species_binomial, trait_name, trait_value, unit, method,
        latitude, longitude, elevation_m, url_source, source_citation,
        project_pi, project_pi_contact, region, country, state_province,
        locality_description, verbatim_family, verbatim_scientific_name,
        name_submitted, family_matched, name_matched, name_matched_author,
        higher_plant_group, tnrs_warning, matched_taxonomic_status,
        scrubbed_taxonomic_status, scrubbed_family, scrubbed_genus,
        scrubbed_specific_epithet, scrubbed_taxon_name_no_author,
        scrubbed_taxon_canonical, scrubbed_author, scrubbed_taxon_name_with_author,
        scrubbed_species_binomial_with_morphospecies, access, id
      FROM agg_traits
      WHERE scrubbed_species_binomial = $1;
    `;

        const result = await client.query(query, [species.trim()]);
        await client.end();

        if (result.rows.length === 0) {
            return res.status(404).json({ message: `No data found for species ${species}` });
        }

        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error('Error fetching trait records by species:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

const getTraitRecordsByTrait = async (req, res) => {
    const { trait } = req.query;
    if (!trait) {
        return res.status(400).json({ error: 'Trait name is required' });
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
        scrubbed_species_binomial, trait_name, trait_value, unit, method,
        latitude, longitude, elevation_m, url_source, source_citation,
        project_pi, project_pi_contact, region, country, state_province,
        locality_description, verbatim_family, verbatim_scientific_name,
        name_submitted, family_matched, name_matched, name_matched_author,
        higher_plant_group, tnrs_warning, matched_taxonomic_status,
        scrubbed_taxonomic_status, scrubbed_family, scrubbed_genus,
        scrubbed_specific_epithet, scrubbed_taxon_name_no_author,
        scrubbed_taxon_canonical, scrubbed_author, scrubbed_taxon_name_with_author,
        scrubbed_species_binomial_with_morphospecies, access, id
      FROM agg_traits
      WHERE trait_name = $1;
    `;

        const result = await client.query(query, [trait.trim()]);
        await client.end();

        if (result.rows.length === 0) {
            return res.status(404).json({ message: `No data found for trait ${trait}` });
        }

        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error('Error fetching trait records by trait:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

module.exports = { getTraitRecordsBySpecies, getTraitRecordsByTrait };
