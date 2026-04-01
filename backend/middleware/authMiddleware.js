const admin = require('firebase-admin');

// TODO: Need to initialize Firebase Admin in server.js or index.js
// using a Service Account Key before using this middleware.

const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // For now during testing, if token is missing, reject it
            // return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
            
            // NOTE: If you haven't fully switched the frontend to use Firebase yet, 
            // you might want to bypass auth temporarily by calling next().
            // return next();
            return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Firebase Auth Error:', error.message);
        return res.status(403).json({ success: false, message: 'Unauthorized: Invalid token' });
    }
};

module.exports = requireAuth;
