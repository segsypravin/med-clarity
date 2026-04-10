require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');
const errorHandler = require('./middleware/errorHandler');
const requireAuth = require('./middleware/authMiddleware');

// ── Firebase Admin Initialization ──────────────────────────────────────────────
try {
    // We are pointing to the standardized service account file
    const serviceAccount = require('./serviceAccount.json');
    
    admin.initializeApp({ 
        credential: admin.credential.cert(serviceAccount) 
    });
    console.log('Firebase Admin initialized successfully.');
} catch (err) {
    console.warn('Firebase Admin init warning:', err.message);
}

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'MED Clarity API', version: '1.0.0', phase: 1 });
});

// ── Routes ────────────────────────────────────────────────────────────────────
// Apply requireAuth to routes that should be protected
app.use('/api/upload', requireAuth, require('./routes/upload'));
app.use('/api/analyze', requireAuth, require('./routes/analyze'));
app.use('/api/history', requireAuth, require('./routes/history'));
app.use('/api/scan', requireAuth, require('./routes/scan'));

// Public or semi-public routes
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/get-doctors', require('./doctor-service/doctorRoutes'));
app.use('/api/settings', requireAuth, require('./routes/settings'));

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
