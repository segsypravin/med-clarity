import { useState } from 'react';
import { MapPin, Star, Phone, Clock } from 'lucide-react';
import { Badge } from '../components/ui/index.jsx';

const SPECIALISTS = ['All', 'Cardiologist', 'Endocrinologist', 'Pulmonologist', 'Gastroenterologist', 'General Physician'];

const DOCTORS = [
    { id: 1, name: 'Dr. Priya Sharma', specialty: 'Cardiologist', rating: 4.9, experience: '14 yrs', location: 'City Heart Clinic, Bhopal', distance: '1.2 km', available: true, phone: '+91-98765-43210', avatar: 'PS' },
    { id: 2, name: 'Dr. Rahul Verma', specialty: 'Endocrinologist', rating: 4.7, experience: '9 yrs', location: 'Medlife Hospital, Bhopal', distance: '2.8 km', available: true, phone: '+91-98123-45678', avatar: 'RV' },
    { id: 3, name: 'Dr. Anjali Gupta', specialty: 'Pulmonologist', rating: 4.8, experience: '11 yrs', location: 'Apollo Clinic, Bhopal', distance: '3.1 km', available: false, phone: '+91-97654-32109', avatar: 'AG' },
    { id: 4, name: 'Dr. Suresh Patel', specialty: 'General Physician', rating: 4.6, experience: '20 yrs', location: 'LifeCare Centre, Bhopal', distance: '0.9 km', available: true, phone: '+91-99887-76655', avatar: 'SP' },
    { id: 5, name: 'Dr. Kavita Joshi', specialty: 'Gastroenterologist', rating: 4.5, experience: '8 yrs', location: 'Fortis Clinic, Bhopal', distance: '4.5 km', available: true, phone: '+91-96543-21098', avatar: 'KJ' },
    { id: 6, name: 'Dr. Arjun Mehta', specialty: 'Cardiologist', rating: 4.8, experience: '16 yrs', location: 'HeartCare Hospital, Bhopal', distance: '2.1 km', available: false, phone: '+91-98001-23456', avatar: 'AM' },
];

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
