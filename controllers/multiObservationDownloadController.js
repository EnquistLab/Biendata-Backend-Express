// controllers/multiObservationDownloadController.js
const pool = require('../config/db');
const archiver = require('archiver');
const { PassThrough } = require('stream');

/**
 * Helper: Creates an in-memory zip file containing one file.
 * @param {String} innerFileName - The file name for the content inside the sub-zip.
 * @param {String|Buffer} fileContent - The content to include.
 * @returns {Promise<Buffer>} - Resolves with a Buffer of the sub-zip.
 */
const createSubZipBuffer = (innerFileName, fileContent) => {
    return new Promise((resolve, reject) => {
        const archive = archiver('zip', { zlib: { level: 9 } });
        const buffers = [];
        archive.on('data', data => buffers.push(data));
        archive.on('error', err => reject(err));
        archive.on('end', () => resolve(Buffer.concat(buffers)));
        archive.append(fileContent, { name: innerFileName });
        archive.finalize();
    });
};

const downloadMultipleObservations = async (req, res, next) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Only POST requests allowed' });
    }
    let { speciesList } = req.body;
    if (!Array.isArray(speciesList) || speciesList.length === 0) {
        return res.status(400).json({ error: 'speciesList must be a non-empty array' });
    }
    // Convert underscores to spaces (for the query)
    const speciesNames = speciesList.map(s => s.replace(/_/g, ' ').trim());

    // Set response headers so the final file is a zip
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="multiple_observations.zip"');

    // Create the master zip archive
    const masterArchive = archiver('zip', { zlib: { level: 9 } });
    masterArchive.on('error', err => {
        console.error('Master archive error:', err);
        return next(err);
    });
    masterArchive.pipe(res);

    try {
        // Process each species sequentially
        for (const species of speciesNames) {
            // Query the database (adjust query if needed)
            const query = `
        SELECT taxonobservation_id, observation_type, datasource, scrubbed_species_binomial, latitude, longitude
        FROM analytical_db.view_full_occurrence_individual
        WHERE scrubbed_species_binomial = $1;
      `;
            const result = await pool.query(query, [species]);

            let csvContent = '';
            if (result.rows.length > 0) {
                const headers = Object.keys(result.rows[0]);
                csvContent += headers.join(',') + '\n';
                result.rows.forEach(row => {
                    const values = headers.map(header => {
                        let value = row[header];
                        if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
                            value = `"${value.replace(/"/g, '""')}"`;
                        }
                        return value;
                    });
                    csvContent += values.join(',') + '\n';
                });
            } else {
                csvContent = `No observations available for species: ${species}`;
            }
            // Instead of appending raw CSV, create a sub zip file for this species.
            const innerFileName = species.replace(/\s+/g, '_') + '_observations.csv';
            const subZipBuffer = await createSubZipBuffer(innerFileName, csvContent);
            // Name the sub zip file (for the master archive) with a .zip extension.
            const outerFileName = species.replace(/\s+/g, '_') + '_observations.zip';
            masterArchive.append(subZipBuffer, { name: outerFileName });
        }
        // Finalize the master archive only when all files are appended.
        await new Promise((resolve, reject) => {
            masterArchive.on('end', resolve);
            masterArchive.on('error', reject);
            masterArchive.finalize();
        });
    } catch (error) {
        console.error('Error generating multiple observations zip:', error);
        next(error);
    }
};

module.exports = { downloadMultipleObservations };
