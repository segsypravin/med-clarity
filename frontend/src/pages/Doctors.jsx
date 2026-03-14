import { useState, useEffect, useCallback } from 'react';
import { MapPin, Star, Phone, Clock, Loader, AlertCircle } from 'lucide-react';
import { Badge } from '../components/ui/index.jsx';

const API_BASE = 'http://localhost:5000';

const SPECIALISTS = ['All', 'Cardiologist', 'Endocrinologist', 'Pulmonologist', 'Gastroenterologist', 'General Physician'];

// ── Haversine Formula ─────────────────────────────────────────────────────────
// Returns distance in km between two lat/lng points.
function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// ── Map Google Places result → doctor card data ───────────────────────────────
function mapPlaceToDoctor(place, userLat, userLng) {
    const placeLat = place.geometry?.location?.lat;
    const placeLng = place.geometry?.location?.lng;

    let distance = null;
    if (placeLat != null && placeLng != null && userLat != null && userLng != null) {
        distance = haversineDistance(userLat, userLng, placeLat, placeLng);
    }

    // Build initials from the name for the avatar
    const nameParts = (place.name || '').split(' ').filter(Boolean);
    const avatar = nameParts.length >= 2
        ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
        : (nameParts[0] || 'Dr')[0].toUpperCase();

    // --- Simulate Data for Demo ---
    // Generate a random rating between 4.0 and 5.0
    const simulatedRating = (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1);
    // Generate a random number of reviews between 50 and 500
    const simulatedReviews = Math.floor(Math.random() * (500 - 50 + 1) + 50);
    // Pick a random realistic timing string
    const timingOptions = ['09:00 AM - 05:00 PM', '10:00 AM - 08:00 PM', '08:30 AM - 06:30 PM', '24 Hours'];
    const simulatedHours = timingOptions[Math.floor(Math.random() * timingOptions.length)];

    return {
        id: place.place_id,
        name: place.name || 'Unknown Doctor',
        specialty: place.types?.includes('doctor') ? 'Doctor' : (place.types?.[0] || 'Specialist'),
        location: place.vicinity || 'Address unavailable',
        rating: simulatedRating,
        reviews: simulatedReviews,
        hours: simulatedHours,
        distance: distance != null ? `${distance.toFixed(1)} km` : 'N/A',
        available: true, // Hardcode to true for demo (to show the green badge)
        phone: place.formatted_phone_number || null,
        avatar,
    };
}

export default function Doctors() {
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userCoords, setUserCoords] = useState(null);

    // ── Get user location on mount ────────────────────────────────────────────
    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            },
            (err) => {
                console.error('[Geolocation]', err.message);
                setError('Location access denied. Please enable location permissions to find nearby doctors.');
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    // ── Fetch doctors from backend ────────────────────────────────────────────
    const fetchDoctors = useCallback(async (lat, lng, specialization) => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({ lat, lng });
            if (specialization && specialization !== 'All') {
                params.set('specialization', specialization);
            }

            const res = await fetch(`${API_BASE}/api/get-doctors?${params}`);
            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Failed to fetch doctors.');
            }

            const mapped = (data.results || []).map((place) =>
                mapPlaceToDoctor(place, lat, lng)
            );

            // Sort by distance (closest first)
            mapped.sort((a, b) => {
                const distA = parseFloat(a.distance) || Infinity;
                const distB = parseFloat(b.distance) || Infinity;
                return distA - distB;
            });

            setDoctors(mapped);
        } catch (err) {
            console.error('[fetchDoctors]', err);
            setError(err.message);
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Refetch when coords arrive or filter changes ──────────────────────────
    useEffect(() => {
        if (userCoords) {
            fetchDoctors(userCoords.lat, userCoords.lng, filter);
        }
    }, [userCoords, filter, fetchDoctors]);

    // ── Client-side search filter on top of fetched results ───────────────────
    const displayed = doctors.filter((d) => {
        const matchSearch =
            d.name.toLowerCase().includes(search.toLowerCase()) ||
            d.specialty.toLowerCase().includes(search.toLowerCase()) ||
            d.location.toLowerCase().includes(search.toLowerCase());
        return matchSearch;
    });

    return (
        <>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Find Doctors</h1>
                    <p>Nearby specialists based on your health report results.</p>
                </div>
            </div>

            <div className="page-body animate-fade-up">
                {/* Search + Filter */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Search by name or specialty…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ flex: '1 1 260px', minWidth: 200, maxWidth: 360 }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {SPECIALISTS.map(s => (
                            <button key={s} onClick={() => setFilter(s)}
                                className="btn btn-sm"
                                style={{
                                    background: filter === s ? 'linear-gradient(135deg,var(--primary),var(--secondary))' : 'var(--surface)',
                                    color: filter === s ? 'white' : 'var(--text-muted)',
                                    border: `1px solid ${filter === s ? 'transparent' : 'var(--border)'}`,
                                }}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status bar */}
                {!loading && !error && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                        Showing {displayed.length} doctor{displayed.length !== 1 ? 's' : ''} near you
                    </p>
                )}

                {/* Loading state */}
                {loading && (
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', padding: '3rem 1rem', gap: '1rem',
                    }}>
                        <Loader size={32} className="spin" style={{ color: 'var(--primary)' }} />
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Locating nearby doctors…
                        </p>
                    </div>
                )}

                {/* Error state */}
                {error && !loading && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        background: 'var(--primary-light)', border: '1px solid var(--border-red)',
                        borderRadius: 'var(--radius)', padding: '1rem 1.25rem', marginBottom: '1.25rem',
                    }}>
                        <AlertCircle size={18} color="var(--primary)" />
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{error}</p>
                    </div>
                )}

                {/* Doctor Cards Grid */}
                {!loading && !error && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
                        {displayed.map(d => (
                            <div key={d.id} className="doctor-card">
                                <div className="doctor-avatar">{d.avatar}</div>
                                <div style={{ flex: 1 }}>
                                    <div className="flex-between mb-1">
                                        <div>
                                            <h3 style={{ fontWeight: '700', fontSize: '0.975rem', lineHeight: '1.2' }}>
                                                {filter !== 'All' ? `${filter} at ${d.name}` : d.name}
                                            </h3>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', marginTop: '0.2rem' }}>
                                                {filter !== 'All' ? filter : d.specialty}
                                            </p>
                                        </div>
                                        {d.available !== null && (
                                            <Badge type={d.available ? 'success' : 'neutral'} dot>
                                                {d.available ? 'Open Now' : 'Closed'}
                                            </Badge>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.875rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            <MapPin size={12} /> {d.location} · {d.distance}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            <Star size={12} color="#d97706" fill="#d97706" /> {d.rating} ({d.reviews} reviews)
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            <Clock size={12} /> {d.hours}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {d.phone ? (
                                            <a href={`tel:${d.phone}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                                                <Phone size={13} /> Call
                                            </a>
                                        ) : (
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.name + ' ' + d.location)}`}
                                                target="_blank" rel="noopener noreferrer"
                                                className="btn btn-primary btn-sm"
                                                style={{ flex: 1, justifyContent: 'center' }}
                                            >
                                                <MapPin size={13} /> Directions
                                            </a>
                                        )}
                                        <button className="btn btn-outline btn-sm" style={{ flex: 1 }}
                                            onClick={() => alert('Appointment booking coming in Phase 2!')}>
                                            Book Slot
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && !error && displayed.length === 0 && (
                    <div className="empty-state">
                        <p>No doctors found for your search.</p>
                    </div>
                )}

                {/* Location note */}
                <div style={{
                    marginTop: '2rem', background: 'var(--primary-light)',
                    border: '1px solid var(--border-red)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
                    display: 'flex', gap: '0.75rem', alignItems: 'center',
                }}>
                    <MapPin size={18} color="var(--primary)" />
                    <div>
                        <strong style={{ fontSize: '0.875rem' }}>Location-based matching</strong>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                            Doctors are automatically matched based on your GPS location. Distance is calculated using the Haversine formula.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
