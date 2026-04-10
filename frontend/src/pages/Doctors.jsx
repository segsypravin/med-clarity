import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { MapPin, Star, Phone, Clock, Loader, AlertCircle } from 'lucide-react';
import { Badge } from '../components/ui/index.jsx';
import { useLanguage } from '../context/LanguageContext';
import { auth } from '../firebase';
import config from '../config';

const API_BASE = config.API_BASE;

export default function Doctors() {
    const { t } = useLanguage();
    const location = useLocation();
    
    // Read initial filter from URL query param
    const queryParams = new URLSearchParams(location.search);
    const initialFilter = queryParams.get('filter') || 'All';
    
    const [filter, setFilter] = useState(initialFilter);
    const [search, setSearch] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userCoords, setUserCoords] = useState(null);

    const SPECIALISTS = ['All', 'Cardiologist', 'Endocrinologist', 'Pulmonologist', 'Gastroenterologist', 'Oncologist', 'General Physician'];

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

    // Move mapPlaceToDoctor inside to use t()
    const mapPlaceToDoctor = useCallback((place, userLat, userLng) => {
        const placeLat = place.geometry?.location?.lat;
        const placeLng = place.geometry?.location?.lng;

        let distance = null;
        if (placeLat != null && placeLng != null && userLat != null && userLng != null) {
            distance = haversineDistance(userLat, userLng, placeLat, placeLng);
        }

        const nameParts = (place.name || '').split(' ').filter(Boolean);
        const avatar = nameParts.length >= 2
            ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
            : (nameParts[0] || 'Dr')[0].toUpperCase();

        const simulatedRating = (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1);
        const simulatedReviews = Math.floor(Math.random() * (500 - 50 + 1) + 50);
        const timingOptions = ['09:00 AM - 05:00 PM', '10:00 AM - 08:00 PM', '08:30 AM - 06:30 PM', '24 Hours'];
        const simulatedHours = timingOptions[Math.floor(Math.random() * timingOptions.length)];

        return {
            id: place.place_id,
            name: place.name || t('doctors.unknown_doctor'),
            specialty: place.types?.includes('doctor') ? 'Doctor' : (place.types?.[0] || 'Specialist'),
            location: place.vicinity || t('doctors.address_unavailable'),
            rating: simulatedRating,
            reviews: simulatedReviews,
            hours: simulatedHours,
            distance: distance != null ? `${distance.toFixed(1)} km` : 'N/A',
            available: true,
            phone: place.formatted_phone_number || null,
            avatar,
        };
    }, [t]);

    // ── Booking Modal State ───────────────────────────────────────────────────
    const [bookingDoctor, setBookingDoctor] = useState(null);
    const [bookingDate, setBookingDate] = useState('Tomorrow');
    const [bookingTime, setBookingTime] = useState('10:00 AM');
    
    const handleConfirmBooking = () => {
        const msg = t('doctors.booking_success')
            .replace('{name}', bookingDoctor.name)
            .replace('{date}', bookingDate)
            .replace('{time}', bookingTime);
        alert(msg);
        setBookingDoctor(null);
    };

    // ── Get user location on mount ────────────────────────────────────────────
    useEffect(() => {
        if (!navigator.geolocation) {
            setError(t('doctors.geolocation_error'));
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            },
            (err) => {
                console.error('[Geolocation]', err.message);
                setError(t('doctors.location_denied'));
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, [t]);

    // ── Fetch doctors from backend ────────────────────────────────────────────
    const fetchDoctors = useCallback(async (lat, lng, specialization) => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({ lat, lng });
            if (specialization && specialization !== 'All') {
                params.set('specialization', specialization);
            }

            const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
            const res = await fetch(`${API_BASE}/api/get-doctors?${params}`, {
                headers: { ...(token && { Authorization: `Bearer ${token}` }) }
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || t('doctors.fetch_error'));
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
    }, [mapPlaceToDoctor, t]);

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
                    <h1>{t('doctors.title')}</h1>
                    <p>{t('doctors.subtitle')}</p>
                </div>
            </div>

            <div className="page-body animate-fade-up">
                {/* Search + Filter */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder={t('doctors.search_placeholder')}
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
                                {s === 'All' ? t('common.all') : t(`doctors.${s.toLowerCase().replace(' ', '_')}`)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status bar */}
                {!loading && !error && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                        {t('doctors.showing_doctors').replace('{count}', displayed.length)}
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
                            {t('doctors.locating')}
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
                                                {filter !== 'All' ? `${t(`doctors.${filter.toLowerCase().replace(' ', '_')}`)} at ${d.name}` : d.name}
                                            </h3>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', marginTop: '0.2rem' }}>
                                                {filter !== 'All' ? t(`doctors.${filter.toLowerCase().replace(' ', '_')}`) : d.specialty}
                                            </p>
                                        </div>
                                        {d.available !== null && (
                                            <Badge type={d.available ? 'success' : 'neutral'} dot>
                                                {d.available ? t('doctors.open_now') : t('doctors.closed')}
                                            </Badge>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.875rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            <MapPin size={12} /> {d.location} · {d.distance}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            <Star size={12} color="#d97706" fill="#d97706" /> {d.rating} ({d.reviews} {t('landing.testimonials').toLowerCase()})
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            <Clock size={12} /> {d.hours}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {d.phone ? (
                                            <a href={`tel:${d.phone}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                                                <Phone size={13} /> {t('doctors.call')}
                                            </a>
                                        ) : (
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.name + ' ' + d.location)}`}
                                                target="_blank" rel="noopener noreferrer"
                                                className="btn btn-primary btn-sm"
                                                style={{ flex: 1, justifyContent: 'center' }}
                                            >
                                                <MapPin size={13} /> {t('doctors.directions')}
                                            </a>
                                        )}
                                        <button className="btn btn-outline btn-sm" style={{ flex: 1 }}
                                            onClick={() => setBookingDoctor(d)}>
                                            {t('doctors.book_slot')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && !error && displayed.length === 0 && (
                    <div className="empty-state">
                        <p>{t('doctors.no_doctors')}</p>
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
                        <strong style={{ fontSize: '0.875rem' }}>{t('doctors.location_matching')}</strong>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                            {t('doctors.location_matching_desc')}
                        </p>
                    </div>
                </div>

                {/* Booking Modal Overlay */}
                {bookingDoctor && (
                  <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                    
                    {/* Dark Blur Backdrop */}
                    <div 
                       style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} 
                       onClick={() => setBookingDoctor(null)} 
                    ></div>

                    {/* White Modal Box */}
                    <div style={{ position: 'relative', backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', zIndex: 10000, width: '400px', maxWidth: '90%', color: '#000000', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                      
                      <h3 style={{ marginTop: 0, fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>{t('doctors.book_appointment')}</h3>
                      <p style={{ marginBottom: '20px' }}>{t('doctors.booking_for')} {bookingDoctor.name}</p>
                      
                      <div className="form-group" style={{ marginBottom: '16px' }}>
                          <label style={{ color: '#000000', display: 'block', marginBottom: '8px' }}>{t('table.date')}</label>
                          <select value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} style={{ width: '100%', padding: '8px', color: '#000000', backgroundColor: '#ffffff', border: '1px solid #ccc', borderRadius: '4px' }}>
                              <option>{t('doctors.today')}</option>
                              <option>{t('doctors.tomorrow')}</option>
                              <option>{t('doctors.in_2_days')}</option>
                              <option>{t('doctors.next_week')}</option>
                          </select>
                      </div>

                      <div className="form-group" style={{ marginBottom: '24px' }}>
                          <label style={{ color: '#000000', display: 'block', marginBottom: '8px' }}>{t('doctors.time_slot')}</label>
                          <select value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} style={{ width: '100%', padding: '8px', color: '#000000', backgroundColor: '#ffffff', border: '1px solid #ccc', borderRadius: '4px' }}>
                              <option>10:00 AM</option>
                              <option>11:30 AM</option>
                              <option>02:00 PM</option>
                              <option>04:30 PM</option>
                              <option>06:00 PM</option>
                          </select>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                          <button className="btn btn-ghost" style={{ flex: 1, color: '#4b5563', border: '1px solid #ccc' }} onClick={() => setBookingDoctor(null)}>
                              {t('common.cancel')}
                          </button>
                          <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleConfirmBooking}>
                              {t('doctors.confirm_booking')}
                          </button>
                      </div>
                      
                    </div>
                  </div>
                )}
            </div>
        </>
    );
}
