// controllers/multiTraitDownloadController.js
const pool = require('../config/db');
const archiver = require('archiver');
const { PassThrough } = require('stream');

/**
 * Helper: Creates an in-memory zip file containing one file.
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

const downloadMultipleTraits = async (req, res, next) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Only POST requests allowed' });
    }

    let { speciesList } = req.body;
    if (!Array.isArray(speciesList) || speciesList.length === 0) {
        return res.status(400).json({ error: 'speciesList must be a non-empty array' });
    }

    // Convert underscores to spaces for the query
    const speciesNames = speciesList.map(s => s.replace(/_/g, ' ').trim());

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="multiple_traits.zip"');

    const masterArchive = archiver('zip', { zlib: { level: 9 } });
    masterArchive.on('error', err => {
        console.error('Master archive error:', err);
        return next(err);
    });
    masterArchive.pipe(res);

    try {
        for (const species of speciesNames) {
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
        ORDER BY trait_name;
      `;
            const result = await pool.query(query, [species]);

            let csvContent = '';
            if (result.rows.length > 0) {
                const headers = Object.keys(result.rows[0]);
                csvContent += headers.join(',') + '\n';
                result.rows.forEach(row => {
                    const values = headers.map(header => {
                        let value = row[header];
                        if (value === null || value === undefined) value = '';
                        else if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
                            value = `"${value.replace(/"/g, '""')}"`;
                        }
                        return value;
                    });
                    csvContent += values.join(',') + '\n';
                });
            } else {
                csvContent = `No trait data available for species: ${species}`;
            }
            const innerFileName = species.replace(/\s+/g, '_') + '_traits.csv';
            const subZipBuffer = await createSubZipBuffer(innerFileName, csvContent);
            const outerFileName = species.replace(/\s+/g, '_') + '_traits.zip';
            masterArchive.append(subZipBuffer, { name: outerFileName });
        }
        await new Promise((resolve, reject) => {
            masterArchive.on('end', resolve);
            masterArchive.on('error', reject);
            masterArchive.finalize();
        });
    } catch (error) {
        console.error('Error generating multiple traits zip:', error);
        next(error);
    }
};

module.exports = { downloadMultipleTraits };
