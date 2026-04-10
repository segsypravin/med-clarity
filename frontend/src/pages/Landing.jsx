import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Zap as LucideZap, Play as LucidePlay, Shield, Activity, CheckCircle, FileText, Heart } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';







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
                <motion.div 
                    animate={{ x: [0, 20, -20, 0], y: [0, -20, 20, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="hero-bg-orb hero-orb-1" 
                />
                <motion.div 
                    animate={{ x: [0, -30, 30, 0], y: [0, 30, -30, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="hero-bg-orb hero-orb-2" 
                />
                
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="hero-content"
                >
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
                        <button className="btn btn-premium btn-lg hero-cta-primary" onClick={() => navigate('/login?mode=signup')}>
                            <LucideZap size={18} fill="white" />
                            {t('landing.get_started_free')}
                        </button>
                        <button className="btn btn-outline btn-lg" onClick={() => {
                            // Quick Demo Logic: Navigate to results with mock data
                            navigate('/results', { state: { result: {
                                summary: "This is a sample medical analysis for demonstration. The AI has detected normal hemoglobin levels but suggests a slight increase in Vitamin D intake.",
                                health_score: 85,
                                overall_status: "Healthy",
                                tests: [
                                    { test: "Hemoglobin", value: "14.2", unit: "g/dL", status: "Normal", simple_explanation: "Hemoglobin is the protein in red blood cells that carries oxygen.", remark: "Well within optimal range." },
                                    { test: "Vitamin D", value: "22", unit: "ng/mL", status: "Low", simple_explanation: "Vitamin D helps your body absorb calcium for strong bones.", remark: "Below recommended level of 30." }
                                ]
                            }}});
                        }}>
                            <LucidePlay size={18} />
                            Quick Demo
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
                </motion.div>

                {/* Floating report card mockup (Refined for Theme Suitability) */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 1, delay: 0.2, type: 'spring' }}
                    className="hero-mockup"
                    style={{ position: 'relative' }}
                >
                    {/* Floating Badges */}
                    <div className="mockup-floating-badge" style={{ top: '-30px', right: '-10px', color: 'var(--primary)', border: '1px solid var(--border-red)', background: 'var(--surface)', boxShadow: 'var(--shadow)', fontWeight: 700 }}>
                        <Shield size={14} /> <span style={{ color: 'var(--text)' }}>Strict Privacy</span>
                    </div>
                    <div className="mockup-floating-badge" style={{ bottom: '20px', left: '-50px', animationDelay: '1s', color: 'var(--primary)', border: '1px solid var(--border-red)', background: 'var(--surface)', boxShadow: 'var(--shadow)', fontWeight: 700 }}>
                        <CheckCircle size={14} /> <span style={{ color: 'var(--text)' }}>AI-Grade 99%</span>
                    </div>

                    <div className="mockup-card-theme" style={{ width: '380px', padding: '1.75rem', border: '1px solid var(--border-red)' }}>
                        <div className="mockup-scan-line" style={{ background: 'linear-gradient(180deg, transparent, var(--primary-glow), transparent)' }} />
                        
                        <div className="mockup-header" style={{ marginBottom: '1.75rem' }}>
                            <div className="mockup-icon" style={{ background: 'var(--primary)', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px var(--primary-glow)' }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                </svg>
                            </div>
                            <div>
                                <div className="mockup-title" style={{ 
                                    fontWeight: 900, 
                                    fontSize: '1.25rem', 
                                    letterSpacing: '-0.03em',
                                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>Health Summary</div>
                                <div className="mockup-sub" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>
                                    <Activity size={12} className="pulse-audio" /> Scanning Live...
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.75rem' }}>
                            {[
                                { label: 'Hemoglobin', val: '14.2 g/dL', color: 'var(--primary)', width: '75%' },
                                { label: 'Glucose', val: '92 mg/dL', color: 'var(--secondary)', width: '45%' },
                                { label: 'Leukocytes', val: '6.4 k/µL', color: '#7f1d1d', width: '60%' }
                            ].map((row, i) => (
                                <div key={row.label} className="mockup-data-row" style={{ marginBottom: '1.25rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, marginBottom: '6px' }}>
                                            <span style={{ color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{row.label}</span>
                                            <span style={{ color: 'var(--text)' }}>{row.val}</span>
                                        </div>
                                        <div className="mockup-progress" style={{ background: 'var(--bg)', height: '10px', borderRadius: '5px' }}>
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: row.width }}
                                                transition={{ duration: 2, delay: 0.5 + (i * 0.2) }}
                                                className="mockup-progress-bar mockup-shimmer" 
                                                style={{ background: row.color, borderRadius: '5px' }} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mockup-summary" style={{ background: 'var(--primary-light)', padding: '1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-red)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <Heart size={14} color="var(--primary)" fill="var(--primary)" />
                                <span className="mockup-summary-label" style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>AI Insight</span>
                            </div>
                            <p className="mockup-summary-text" style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text)', margin: 0, fontWeight: 500 }}>
                                Your vital markers are in optimal range. Maintain current protein intake for better energy levels.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* ── FEATURES ── */}
            <motion.section 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                id="features" 
                className="landing-section"
            >
                <div className="landing-section-inner">
                    <div className="section-header">
                        <span className="section-eyebrow">{t('landing.why_med_clarity')}</span>
                        <h2 className="section-heading">{t('landing.everything_you_need')}</h2>
                        <p className="section-desc">{t('landing.powered_by_ai')}</p>
                    </div>
                    <div className="features-grid">
                        {featuresWithIcons.map((f, i) => (
                            <motion.div 
                                key={f.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="feature-card glass"
                            >
                                <div className="feature-icon">{f.icon}</div>
                                <h3 className="feature-title">{f.title}</h3>
                                <p className="feature-desc">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

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
