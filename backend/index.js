require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'MED Clarity API', version: '1.0.0', phase: 1 });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/upload', require('./routes/upload'));
app.use('/api/analyze', require('./routes/analyze'));
app.use('/api/history', require('./routes/history'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/get-doctors', require('./doctor-service/doctorRoutes'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/scan', require('./routes/scan'));

// ── Root ──────────────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
    res.json({
        message: 'MED Clarity API is running 🚀',
        endpoints: ['/api/health', '/api/upload', '/api/analyze', '/api/history', '/api/doctors', '/api/get-doctors', '/api/settings'],
    });
});

// ── Error Handler (must be last) ──────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n✅ MED Clarity Backend running at http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
