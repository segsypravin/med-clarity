const express = require('express');
const router = express.Router();

// Stub doctor data — Phase 2: replace with Google Places API / custom DB
const DOCTORS = [
    { id: 1, name: 'Dr. Priya Sharma', specialty: 'Cardiologist', rating: 4.9, experience: '14 yrs', location: 'City Heart Clinic, Bhopal', distance: '1.2 km', available: true, phone: '+91-98765-43210' },
    { id: 2, name: 'Dr. Rahul Verma', specialty: 'Endocrinologist', rating: 4.7, experience: '9 yrs', location: 'Medlife Hospital, Bhopal', distance: '2.8 km', available: true, phone: '+91-98123-45678' },
    { id: 3, name: 'Dr. Anjali Gupta', specialty: 'Pulmonologist', rating: 4.8, experience: '11 yrs', location: 'Apollo Clinic, Bhopal', distance: '3.1 km', available: false, phone: '+91-97654-32109' },
    { id: 4, name: 'Dr. Suresh Patel', specialty: 'General Physician', rating: 4.6, experience: '20 yrs', location: 'LifeCare Centre, Bhopal', distance: '0.9 km', available: true, phone: '+91-99887-76655' },
    { id: 5, name: 'Dr. Kavita Joshi', specialty: 'Gastroenterologist', rating: 4.5, experience: '8 yrs', location: 'Fortis Clinic, Bhopal', distance: '4.5 km', available: true, phone: '+91-96543-21098' },
    { id: 6, name: 'Dr. Arjun Mehta', specialty: 'Cardiologist', rating: 4.8, experience: '16 yrs', location: 'HeartCare Hospital, Bhopal', distance: '2.1 km', available: false, phone: '+91-98001-23456' },
];

/**
 * GET /api/doctors
 * Query params:
 *   ?specialist=Cardiologist  → filter by specialty
 *   ?available=true            → filter by availability
 *   ?lat=23.2&lng=77.4         → Phase 2: sort by GPS distance
 */
router.get('/', (req, res) => {
    let results = [...DOCTORS];

    if (req.query.specialist) {
        results = results.filter(d =>
            d.specialty.toLowerCase() === req.query.specialist.toLowerCase()
        );
    }
    if (req.query.available === 'true') {
        results = results.filter(d => d.available);
    }

    res.json({ success: true, count: results.length, doctors: results });
});

/**
 * GET /api/doctors/:id
 */
router.get('/:id', (req, res) => {
    const doctor = DOCTORS.find(d => d.id === parseInt(req.params.id));
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });
    res.json({ success: true, doctor });
});

module.exports = router;
