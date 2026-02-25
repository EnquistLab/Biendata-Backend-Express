// controllers/multiRangeDownloadController.js
const pool = require('../config/db');
const https = require('https');
const archiver = require('archiver');

/**
 * Helper to fetch a remote file as a Buffer.
 */
const fetchRemoteFileBuffer = (fileUrl) => {
    return new Promise((resolve, reject) => {
        https.get(fileUrl, (response) => {
            if (response.statusCode !== 200) {
                return reject(new Error(`Failed to get file. Status code: ${response.statusCode}`));
            }
            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => resolve(Buffer.concat(chunks)));
        }).on('error', (err) => reject(err));
    });
};

const downloadMultipleRanges = async (req, res, next) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Only POST requests allowed' });
    }

    let { speciesList } = req.body;
    if (!Array.isArray(speciesList) || speciesList.length === 0) {
        return res.status(400).json({ error: 'speciesList must be a non-empty array' });
    }

    // For ranges, assume species names in the database are stored with underscores.
    const speciesListFormatted = speciesList.map(s => s.replace(/\s+/g, '_'));

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="multiple_ranges.zip"');

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', err => {
        console.error('Archive error:', err);
        return next(err);
    });
    archive.pipe(res);

    try {
        for (const species of speciesListFormatted) {
            const query = `
        SELECT a.species,
          CONCAT(
            'https://www.biendatastore.xyz/range/', a.run, '/', b.batch, '/_outputs',
            substring(a.rel_path from '(^.*/)' ), a.basename, '.shp.zip'
          ) AS file_url
        FROM ranges.range a 
        JOIN ranges.batch b ON a.batch_id = b.batch_id
        WHERE a.species = $1
          AND a.is_default = 1
        LIMIT 1;
      `;
            const result = await pool.query(query, [species]);
            if (result.rows.length === 0) {
                archive.append(`No range file available for species: ${species}`, { name: species + '_range.txt' });
                continue;
            }

            const fileUrl = result.rows[0].file_url;
            try {
                const fileBuffer = await fetchRemoteFileBuffer(fileUrl);
                const fileName = species + '_range.zip';
                archive.append(fileBuffer, { name: fileName });
            } catch (err) {
                console.error(`Error fetching range file for species ${species}:`, err);
                archive.append(`Error fetching range file for species: ${species}`, { name: species + '_range_error.txt' });
            }
        }
        await new Promise((resolve, reject) => {
            archive.on('end', resolve);
            archive.on('error', reject);
            archive.finalize();
        });
    } catch (error) {
        console.error('Error generating multiple ranges zip:', error);
        next(error);
    }
};

module.exports = { downloadMultipleRanges };
