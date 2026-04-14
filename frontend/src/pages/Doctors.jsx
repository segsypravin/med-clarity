import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MapPin, Star, Phone, Clock, Loader, AlertCircle } from 'lucide-react';
import { Badge } from '../components/ui/index.jsx';
import { useLanguage } from '../context/LanguageContext';
import { useDoctors } from '../context/DoctorContext';

const SPECIALISTS = ['All', 'Cardiologist', 'Endocrinologist', 'Pulmonologist', 'Gastroenterologist', 'Oncologist', 'General Physician'];

export default function Doctors() {
    const { t } = useLanguage();
    const location = useLocation();
    const { doctors: cachedDoctors, loading, error, refresh } = useDoctors();
    
    // Read initial filter from URL query param
    const queryParams = new URLSearchParams(location.search);
    const initialFilter = queryParams.get('filter') || 'All';
    
    const [filter, setFilter] = useState(initialFilter);
    const [search, setSearch] = useState('');

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

    // ── Client-side search filter on top of cached results ───────────────────
    const displayed = cachedDoctors.filter((d) => {
        // Filter by specialty if not 'All'
        if (filter !== 'All' && d.specialty !== filter) {
            // Check if it's a generic 'Doctor' or 'Specialist' and if the query filter matches their name/types?
            // Actually, the backend currently returns generic 'healthcare' places.
            // For now, if user picks a filter, we show doctors that match that specialty string.
            // If the cached results don't have that specific specialty string in 'specialty' field, 
            // they might be filtered out. 
            // However, the current backend doesn't provide fine-grained specialty.
            // Let's allow the filter to be a fuzzy match or just trust the client-side specialization logic.
            if (!d.specialty.toLowerCase().includes(filter.toLowerCase()) && d.specialty !== 'Doctor' && d.specialty !== 'Specialist') {
                return false;
            }
        }

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
                <div className="page-header-right">
                    <button className="btn btn-outline btn-sm" onClick={refresh} disabled={loading}>
                        <Clock size={14} /> {loading ? t('common.loading') : t('common.refresh') || 'Refresh'}
                    </button>
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
