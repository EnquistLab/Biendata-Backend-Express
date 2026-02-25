const { Client } = require('pg');

const getSpeciesRangeData = async (req, res) => {
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
            SELECT ST_AsText(geom) AS geometry, species, gid
            FROM ranges
            WHERE species = $1;
        `;

        const result = await client.query(query, [species]);

        await client.end();

        if (result.rows.length === 0) {
            return res.status(404).json({ message: `No data found for species ${species}` });
        }

        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error('Error fetching species range data:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

module.exports = { getSpeciesRangeData };
