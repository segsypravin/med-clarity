/**
 * Shared utilities for doctor calculations and mapping.
 */

export const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const mapPlaceToDoctor = (place, userLat, userLng, t) => {
    const placeLat = place.location?.lat || place.geometry?.location?.lat;
    const placeLng = place.location?.lng || place.geometry?.location?.lng;

    let distance = null;
    if (placeLat != null && placeLng != null && userLat != null && userLng != null) {
        distance = haversineDistance(userLat, userLng, placeLat, placeLng);
    }

    const nameParts = (place.name || '').split(' ').filter(Boolean);
    const avatar = nameParts.length >= 2
        ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
        : (nameParts[0] || 'Dr')[0].toUpperCase();

    // Use specific deterministic randomness seeded by place_id if possible
    const seed = place.place_id ? place.place_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : Math.random();
    const seededRandom = () => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    };

    const simulatedRating = (seededRandom() * (5.0 - 4.0) + 4.0).toFixed(1);
    const simulatedReviews = Math.floor(seededRandom() * (500 - 50 + 1) + 50);
    const timingOptions = ['09:00 AM - 05:00 PM', '10:00 AM - 08:00 PM', '08:30 AM - 06:30 PM', '24 Hours'];
    const simulatedHours = timingOptions[Math.floor(seededRandom() * timingOptions.length)];

    return {
        id: place.place_id,
        name: place.name || t('doctors.unknown_doctor'),
        specialty: place.types?.includes('doctor') ? 'Doctor' : (place.types?.[0] || 'Specialist'),
        location: place.address || place.vicinity || t('doctors.address_unavailable'),
        rating: simulatedRating,
        reviews: simulatedReviews,
        hours: simulatedHours,
        distance: distance != null ? `${distance.toFixed(1)} km` : 'N/A',
        available: true,
        phone: place.formatted_phone_number || null,
        avatar,
    };
};
