import { useState } from 'react';
import { MapPin, Star, Phone, Clock } from 'lucide-react';
import { Badge } from '../components/ui/index.jsx';

const SPECIALISTS = ['All', 'Cardiologist', 'Endocrinologist', 'Pulmonologist', 'Gastroenterologist', 'General Physician'];

const DOCTORS = [];

export default function Doctors() {
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');

    const displayed = DOCTORS.filter(d => {
        const matchSpec = filter === 'All' || d.specialty === filter;
        const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase());
        return matchSpec && matchSearch;
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

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Showing {displayed.length} doctor{displayed.length !== 1 ? 's' : ''} near you
                </p>

                {/* Doctor Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
                    {displayed.map(d => (
                        <div key={d.id} className="doctor-card">
                            <div className="doctor-avatar">{d.avatar}</div>
                            <div style={{ flex: 1 }}>
                                <div className="flex-between mb-1">
                                    <div>
                                        <h3 style={{ fontWeight: '700', fontSize: '0.975rem' }}>{d.name}</h3>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>{d.specialty}</p>
                                    </div>
                                    <Badge type={d.available ? 'success' : 'neutral'} dot>
                                        {d.available ? 'Available' : 'Busy'}
                                    </Badge>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.875rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        <MapPin size={12} /> {d.location} · {d.distance}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        <Star size={12} color="#d97706" fill="#d97706" /> {d.rating} · {d.experience} experience
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        <Clock size={12} /> Mon–Sat · 9 AM – 6 PM
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <a href={`tel:${d.phone}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                                        <Phone size={13} /> Call
                                    </a>
                                    <button className="btn btn-outline btn-sm" style={{ flex: 1 }}
                                        onClick={() => alert('Appointment booking coming in Phase 2!')}>
                                        Book Slot
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {displayed.length === 0 && (
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
                            In Phase 2, doctors will be automatically matched based on your GPS location and detected health conditions.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
