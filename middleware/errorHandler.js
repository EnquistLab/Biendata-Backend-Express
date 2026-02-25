// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ message: 'Internal Server Error', details: err.message });
};

module.exports = errorHandler;

