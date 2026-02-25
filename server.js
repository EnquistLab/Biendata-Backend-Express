// server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const speciesRoutes = require('./routes/speciesRoutes');
const rangeRoutes = require('./routes/rangeRoutes');
const observationRoutes = require('./routes/observationRoutes');
const rangeDataRoutes = require('./routes/rangeDataRoutes');
const speciesRangeRoutes = require('./routes/speciesRangeRoutes');
const occurrenceRoutes = require('./routes/occurrenceRoutes');
const multiOccurrenceRoutes = require('./routes/multiOccurrenceRoutes');
const observationDownloadRoutes = require('./routes/observationDownloadRoutes');
const rangeDownloadRoutes = require('./routes/rangeDownloadRoutes');
const traitDownloadRoutes = require('./routes/traitDownloadRoutes');
const multiSpeciesRoutes = require('./routes/multiSpeciesRoutes');
const multiRangeRoutes = require('./routes/multiRangeRoutes');
const multiObservationRoutes = require('./routes/multiObservationRoutes');
const multiObservationDownloadRoutes = require('./routes/multiObservationDownloadRoutes');
const multiRangeDownloadRoutes = require('./routes/multiRangeDownloadRoutes');
const multiTraitDownloadRoutes = require('./routes/multiTraitDownloadRoutes');
const traitRoutes = require('./routes/traitRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const port = process.env.PORT || 3005;

const allowedOrigins = ['https://biendata.org', 'http://mint-pheasant.nceas.ucsb.edu:3004', 'https://www.biendata.org'];

// Define rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Too many requests from this IP, please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Enable CORS
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
}));

app.use(express.json());

// Apply the rate limiter to all `/api` routes
app.use('/api', apiLimiter);
app.set('trust proxy', 1);

// Routes
app.use('/api/species', speciesRoutes);
app.use('/api/range', rangeRoutes);
app.use('/api/range', rangeDataRoutes);
app.use('/api/species-ranges', speciesRangeRoutes);
app.use('/api/observations', observationRoutes);
app.use('/api/occurrences', occurrenceRoutes);
app.use('/api/multi-occurrences', multiOccurrenceRoutes);
app.use('/api/download', observationDownloadRoutes);
app.use('/api/download', rangeDownloadRoutes);
app.use('/api/download', traitDownloadRoutes);
app.use('/api/multiple-species', multiSpeciesRoutes);
app.use('/api/multiple-ranges', multiRangeRoutes);
app.use('/api/multiple-observations', multiObservationRoutes);
app.use('/api/traits', traitRoutes);
app.use('/api/download', multiObservationDownloadRoutes);
app.use('/api/download', multiRangeDownloadRoutes);
app.use('/api/download', multiTraitDownloadRoutes);


// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
