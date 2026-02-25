// controllers/rangeDownloadController.js

const pool = require('../config/db');
const https = require('https');

// In-memory cache (for demonstration; consider using Redis for production)
const fileUrlCache = new Map();

const downloadRangeShapefile = async (req, res, next) => {
    const { species } = req.query;

    if (!species) {
        return res.status(400).json({ error: 'Species name is required' });
    }

    const formattedSpecies = species.replace(/ /g, '_');

    // Check if the file URL is already cached
    if (fileUrlCache.has(formattedSpecies)) {
        const cachedFileUrl = fileUrlCache.get(formattedSpecies);
        return streamFileFromUrl(cachedFileUrl, formattedSpecies, res);
    }

    try {
        const client = await pool.connect();

        // SQL query to retrieve the shapefile URL for the given species
        const query = `
            SELECT a.species,
            CONCAT(
                'https://www.biendatastore.xyz/range/', a.run, '/', b.batch, '/_outputs',
                substring(a.rel_path from '(^.*/)' ), a.basename, '.shp.zip'
            ) AS file_url
            FROM ranges.range a 
            JOIN ranges.batch b ON a.batch_id=b.batch_id
            WHERE a.species = $1
            AND a.is_default = 1
            LIMIT 1;
        `;

        const result = await client.query(query, [formattedSpecies]);
        client.release(); // Release the client back to the pool

        if (result.rows.length === 0) {
            return res.status(404).json({ message: `No range file available for species ${formattedSpecies}` });
        }

        const fileUrl = result.rows[0].file_url;

        // Cache the file URL
        fileUrlCache.set(formattedSpecies, fileUrl);

        // Stream the file from the URL
        return streamFileFromUrl(fileUrl, formattedSpecies, res);

    } catch (error) {
        console.error('Error fetching range shapefile:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

// Helper function to stream the file from the URL
const streamFileFromUrl = (fileUrl, species, res) => {
    https.get(fileUrl, (fileResponse) => {
        if (fileResponse.statusCode !== 200) {
            return res.status(404).json({ message: `Unable to download file for species ${species}` });
        }

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${species}_range.zip"`);
        fileResponse.pipe(res);
    }).on('error', (err) => {
        console.error('Error downloading file:', err);
        res.status(500).json({ error: 'Error downloading shapefile', details: err.message });
    });
};

module.exports = { downloadRangeShapefile };
