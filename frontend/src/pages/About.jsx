import { Activity, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const features = [
    { phase: 'Phase 1', status: 'done', list: ['Medical report upload (PDF/image/CT/X-ray)', 'File validation & secure storage', 'Basic health report display', 'Multi-page web interface', 'Red & white accessible UI'] },
    { phase: 'Phase 2', status: 'upcoming', list: ['OCR-based text extraction (Tesseract)', 'AI-powered health analysis (Gemini API)', 'Health score calculation (0–100)', 'Simple language summary generation', 'Multilingual output (English & Hindi)', 'Text-to-speech audio output', 'Personalized suggestions & precautions'] },
    { phase: 'Phase 3', status: 'upcoming', list: ['Live nearby doctor recommendations', 'Specialist matching by condition', 'Location-based doctor availability', 'Doctor appointment booking', 'Health report history & comparison', 'MRI & ultrasound scan support', 'More regional languages', 'Cloud scaling & mobile app (Android/iOS)'] },
];

const statusColor = { done: '#059669', upcoming: '#d97706' };
const statusLabel = { done: 'Complete ✓', upcoming: 'Upcoming' };

export default function About() {
    const { t } = useLanguage();

    const translatedUserList = t('about.user_list', { returnObjects: true }) || [
        'Elderly patients with complex lab results',
        'Rural or semi-urban users with limited medical knowledge',
        'Patients who speak Hindi or regional languages',
        'Caregivers managing a family member\'s health'
    ];

    return (
        <>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>{t('about.title')}</h1>
                    <p>{t('about.subtitle')}</p>
                </div>
            </div>

            <div className="page-body animate-fade-up">
                {/* Hero Card */}
                <div className="card card-p-lg mb-4" style={{
                    background: 'linear-gradient(135deg, #fef2f2 0%, #fff5f5 100%)',
                    border: '1px solid rgba(192,21,42,0.15)',
                    display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap',
                }}>
                    <div style={{
                        width: 72, height: 72, flexShrink: 0,
                        background: 'linear-gradient(135deg, #c0152a, #e83a4a)',
                        borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(192,21,42,0.25)',
                    }}>
                        <Activity size={36} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
                            {t('about.app_name_full')}
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', maxWidth: 600 }}>
                            {t('about.app_desc')}
                        </p>
                    </div>
                </div>

                {/* Goals */}
                <div className="grid-2 mb-4">
                    <div className="card card-p">
                        <h2 className="section-title mb-2">🎯 {t('about.core_goal')}</h2>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                            {t('about.core_goal_desc')}
                        </p>
                    </div>
                    <div className="card card-p">
                        <h2 className="section-title mb-2">👥 {t('about.target_users')}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {translatedUserList.map(u => (
                                <div key={u} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    <CheckCircle size={14} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} /> {u}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Roadmap */}
                <h2 className="section-title mb-3">{t('about.roadmap')}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {features.map(({ phase, status, list }) => (
                        <div key={phase} className="card card-p" style={{ borderLeft: `4px solid ${statusColor[status]}` }}>
                            <div className="flex-between mb-2">
                                <h3 style={{ fontWeight: '700', fontSize: '1rem' }}>{phase}</h3>
                                <span style={{ fontSize: '0.78rem', fontWeight: '600', color: statusColor[status] }}>
                                    {status === 'done' ? '✓ ' : '⏳ '}{status === 'done' ? t('common.success') : 'Upcoming'}
                                </span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.35rem' }}>
                                {list.map(item => (
                                    <div key={item} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', alignItems: 'flex-start' }}>
                                        {status === 'done'
                                            ? <CheckCircle size={13} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
                                            : <Clock size={13} color="var(--warning)" style={{ flexShrink: 0, marginTop: 2 }} />}
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tech Stack */}
                <div className="card card-p mt-4 mb-4">
                    <h2 className="section-title mb-3">🛠 {t('about.tech_stack')}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.875rem' }}>
                        {[
                            ['Frontend', 'React + Vite'],
                            ['Routing', 'React Router'],
                            ['Styling', 'Vanilla CSS'],
                            ['Backend', 'Node.js + Express'],
                            ['File Handling', 'Multer'],
                            ['OCR (Phase 2)', 'Tesseract.js'],
                            ['AI (Phase 2)', 'Google Gemini API'],
                            ['TTS (Phase 2)', 'Web Speech API'],
                            ['Auth (Phase 3)', 'JWT / OAuth'],
                            ['Mobile', 'React Native / PWA'],
                        ].map(([layer, tech]) => (
                            <div key={layer} style={{ padding: '0.75rem', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{layer}</div>
                                <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{tech}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <p>{t('about.version_footer')}</p>
                    <Link to="/upload" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                        {t('about.get_started')}
                    </Link>
                </div>
            </div>
        </>
    );
}
