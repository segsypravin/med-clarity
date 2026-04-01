const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

/**
 * GET /api/history
 * Returns all uploaded report records for the authenticated user
 */
router.get('/', async (req, res) => {
    try {
        const uid = req.user.uid;
        const snapshot = await admin.firestore()
            .collection('users')
            .doc(uid)
            .collection('history')
            .orderBy('createdAt', 'desc')
            .get();
            
        const records = [];
        snapshot.forEach(doc => {
            records.push({ id: doc.id, ...doc.data() });
        });

        res.json({ success: true, count: records.length, records });
    } catch (err) {
        console.error('Error fetching history:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch user history.' });
    }
});

/**
 * POST /api/history
 * Add a record for the authenticated user
 */
router.post('/', async (req, res) => {
    try {
        const uid = req.user.uid;
        const recordData = { 
            ...req.body, 
            createdAt: new Date().toISOString() 
        };

        const docRef = await admin.firestore()
            .collection('users')
            .doc(uid)
            .collection('history')
            .add(recordData);

        res.status(201).json({ success: true, record: { id: docRef.id, ...recordData } });
    } catch (err) {
        console.error('Error saving history:', err);
        res.status(500).json({ success: false, message: 'Failed to save record.' });
    }
});

/**
 * DELETE /api/history/:id
 * Delete a record by id for the authenticated user
 */
router.delete('/:id', async (req, res) => {
    try {
        const uid = req.user.uid;
        const recordId = req.params.id;

        await admin.firestore()
            .collection('users')
            .doc(uid)
            .collection('history')
            .doc(recordId)
            .delete();

        res.json({ success: true, message: 'Record deleted.' });
    } catch (err) {
        console.error('Error deleting history:', err);
        res.status(500).json({ success: false, message: 'Failed to delete record.' });
    }
});

module.exports = router;

