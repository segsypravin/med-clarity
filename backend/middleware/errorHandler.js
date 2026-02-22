/**
 * Global error handling middleware.
 * Must be registered AFTER all routes in index.js.
 */
function errorHandler(err, _req, res, _next) {
    console.error('[Error]', err.message);

    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, message: 'File too large. Maximum size is 10 MB.' });
    }

    // Custom thrown errors
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
        success: false,
        message: err.message || 'An unexpected server error occurred.',
    });
}

module.exports = errorHandler;
