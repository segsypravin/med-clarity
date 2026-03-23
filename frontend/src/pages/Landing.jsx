import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';







export default function Landing() {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const translatedFeatures = t('landing.features_list', { returnObjects: true }) || [
        { icon: '🧬', title: 'AI-Powered Analysis', desc: 'Our advanced AI reads your medical reports...' },
        { icon: '🔒', title: 'Bank-Grade Security', desc: 'Your health data is encrypted...' },
        { icon: '👨‍⚕️', title: 'Doctor Connect', desc: 'Instantly connect with certified specialists...' },
        { icon: '📊', title: 'Health Trends', desc: 'Track your health metrics over time...' },
        { icon: '⚡', title: 'Instant Results', desc: 'Upload your report and get a summary...' },
        { icon: '🌐', title: 'Multi-Format Support', desc: 'Upload PDFs, images, or scanned documents...' },
    ];

    // Manual icon mapping since translations only hold text
    const icons = ['🧬', '🔒', '👨‍⚕️', '📊', '⚡', '🌐'];
    const featuresWithIcons = translatedFeatures.map((f, i) => ({ ...f, icon: icons[i] }));

    const translatedSteps = t('landing.steps_list', { returnObjects: true }) || [
        { title: 'Upload Your Report', desc: 'Drag & drop your medical document...' },
        { title: 'AI Processes It', desc: 'Our engine extracts and interprets every medical term...' },
        { title: 'Read Plain English', desc: 'Get a clear, jargon-free summary...' },
        { title: 'Track Your Health', desc: 'Save reports, view trends, and share...' }
    ];

    return (
        <div className="landing-page">
            {/* ── NAV ── */}
            <nav className="landing-nav">
                <div className="landing-nav-inner">
                    <div className="landing-logo">
                        <div className="landing-logo-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            </svg>
                        </div>
                        <span className="landing-logo-text">MED<span>Clarity</span></span>
                    </div>
                    <div className="landing-nav-links">
                        <a href="#features" className="landing-nav-link">{t('landing.features')}</a>
                        <a href="#how-it-works" className="landing-nav-link">{t('landing.how_it_works')}</a>
                        {/* <a href="#testimonials" className="landing-nav-link">{t('landing.testimonials')}</a> */}
                    </div>
                    <div className="flex-gap">
                        <button className="btn btn-ghost landing-nav-btn" onClick={() => navigate('/login')}>{t('landing.sign_in')}</button>
                        <button className="btn btn-primary" onClick={() => navigate('/login?mode=signup')}>{t('landing.get_started_free')}</button>
                    </div>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="hero-section">
                <div className="hero-bg-orb hero-orb-1" />
                <div className="hero-bg-orb hero-orb-2" />
                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="hero-badge-dot" />
                        {t('landing.hero_badge')}
                    </div>
                    <h1 className="hero-title">
                        {t('landing.hero_title')}
                    </h1>
                    <p className="hero-subtitle">
                        {t('landing.hero_subtitle')}
                    </p>
                    <div className="hero-cta">
                        <button className="btn btn-primary btn-lg hero-cta-primary" onClick={() => navigate('/login?mode=signup')}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            {t('landing.get_started_free')}
                        </button>
                        <button className="btn btn-outline btn-lg" onClick={() => navigate('/login')}>
                            {t('login.sign_in_to_dash')}
                        </button>
                    </div>
                    <div className="hero-stats">
                        <div className="hero-stat">
                            <span className="hero-stat-value">10k+</span>
                            <span className="hero-stat-label">{t('landing.stats_users')}</span>
                        </div>
                        <div className="hero-stat">
                            <span className="hero-stat-value">50k+</span>
                            <span className="hero-stat-label">{t('landing.stats_reports')}</span>
                        </div>
                    </div>
                </div>
                {/* Floating report card mockup */}
                <div className="hero-mockup">
                    <div className="mockup-card">
                        <div className="mockup-header">
                            <div className="mockup-icon">📄</div>
                            <div>
                                <div className="mockup-title">Sample Medical Report</div>
                                <div className="mockup-sub">Ready for analysis...</div>
                            </div>
                        </div>
                        <div className="mockup-divider" />
                        <div className="mockup-row"><span className="mockup-key" style={{ width: '40%', height: '12px', background: 'var(--surface)', borderRadius: '4px' }}></span><span className="mockup-val" style={{ width: '20%', height: '12px', background: 'var(--surface)', borderRadius: '4px' }}></span></div>
                        <div className="mockup-row"><span className="mockup-key" style={{ width: '60%', height: '12px', background: 'var(--surface)', borderRadius: '4px' }}></span><span className="mockup-val" style={{ width: '30%', height: '12px', background: 'var(--surface)', borderRadius: '4px' }}></span></div>
                        <div className="mockup-row"><span className="mockup-key" style={{ width: '50%', height: '12px', background: 'var(--surface)', borderRadius: '4px' }}></span><span className="mockup-val" style={{ width: '25%', height: '12px', background: 'var(--surface)', borderRadius: '4px' }}></span></div>
                        <div className="mockup-row"><span className="mockup-key" style={{ width: '30%', height: '12px', background: 'var(--surface)', borderRadius: '4px' }}></span><span className="mockup-val" style={{ width: '15%', height: '12px', background: 'var(--surface)', borderRadius: '4px' }}></span></div>
                        <div className="mockup-divider" />
                        <div className="mockup-summary">
                            <span className="mockup-summary-label">AI Summary</span>
                            <p className="mockup-summary-text">Upload a report to see an easy-to-understand, personalized AI summary right here.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section id="features" className="landing-section">
                <div className="landing-section-inner">
                    <div className="section-header">
                        <span className="section-eyebrow">{t('landing.why_med_clarity')}</span>
                        <h2 className="section-heading">{t('landing.everything_you_need')}</h2>
                        <p className="section-desc">{t('landing.powered_by_ai')}</p>
                    </div>
                    <div className="features-grid">
                        {featuresWithIcons.map(f => (
                            <div key={f.title} className="feature-card">
                                <div className="feature-icon">{f.icon}</div>
                                <h3 className="feature-title">{f.title}</h3>
                                <p className="feature-desc">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section id="how-it-works" className="landing-section landing-section-alt">
                <div className="landing-section-inner">
                    <div className="section-header">
                        <span className="section-eyebrow">{t('landing.how_it_works')}</span>
                        <h2 className="section-heading">{t('landing.steps_list.0.title')}<br />in four simple steps</h2>
                    </div>
                    <div className="steps-grid">
                        {translatedSteps.map((s, i) => (
                            <div key={s.title} className="step-card">
                                <div className="step-num">{`0${i + 1}`}</div>
                                {i < translatedSteps.length - 1 && <div className="step-connector" />}
                                <h3 className="step-title">{s.title}</h3>
                                <p className="step-desc">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA BANNER ── */}
            <section className="cta-banner">
                <div className="cta-banner-orb" />
                <h2 className="cta-banner-title">{t('landing.ready_to_understand')}</h2>
                <p className="cta-banner-desc">{t('landing.join_thousands')}</p>
                <button className="btn btn-lg cta-banner-btn" onClick={() => navigate('/login?mode=signup')}>
                    {t('landing.get_started_it_is_free')}
                </button>
            </section>

            {/* ── FOOTER ── */}
            <footer className="landing-footer">
                <div className="landing-footer-inner">
                    <div className="landing-logo">
                        <div className="landing-logo-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            </svg>
                        </div>
                        <span className="landing-logo-text">MED<span>Clarity</span></span>
                    </div>
                    <p className="landing-footer-copy">© 2025 MED Clarity. {t('landing.all_rights_reserved')}</p>
                </div>
            </footer>
        </div>
    );
}
