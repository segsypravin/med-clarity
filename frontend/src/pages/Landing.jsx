import { useNavigate } from 'react-router-dom';

const features = [
    {
        icon: '🧬',
        title: 'AI-Powered Analysis',
        desc: 'Our advanced AI reads your medical reports and breaks down complex terminology into plain language you actually understand.',
    },
    {
        icon: '🔒',
        title: 'Bank-Grade Security',
        desc: 'Your health data is encrypted with AES-256 and stored with zero third-party access. Your privacy is non-negotiable.',
    },
    {
        icon: '👨‍⚕️',
        title: 'Doctor Connect',
        desc: 'Instantly connect with certified specialists who can review your simplified reports and answer your questions.',
    },
    {
        icon: '📊',
        title: 'Health Trends',
        desc: 'Track your health metrics over time with beautiful charts that make spotting patterns effortless.',
    },
    {
        icon: '⚡',
        title: 'Instant Results',
        desc: 'Upload your report and get a simplified, easy-to-read summary in under 30 seconds.',
    },
    {
        icon: '🌐',
        title: 'Multi-Format Support',
        desc: 'Upload PDFs, images, or scanned documents. We handle blood work, MRIs, X-rays, and more.',
    },
];

const steps = [
    { num: '01', title: 'Upload Your Report', desc: 'Drag & drop your medical document — PDF, image, or scan.' },
    { num: '02', title: 'AI Processes It', desc: 'Our engine extracts and interprets every medical term and value.' },
    { num: '03', title: 'Read Plain English', desc: 'Get a clear, jargon-free summary with actionable insights.' },
    { num: '04', title: 'Track Your Health', desc: 'Save reports, view trends, and share with your doctor.' },
];

const testimonials = [];

const stats = [];

export default function Landing() {
    const navigate = useNavigate();

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
                        <a href="#features" className="landing-nav-link">Features</a>
                        <a href="#how-it-works" className="landing-nav-link">How it Works</a>
                        <a href="#testimonials" className="landing-nav-link">Testimonials</a>
                    </div>
                    <div className="flex-gap">
                        <button className="btn btn-ghost landing-nav-btn" onClick={() => navigate('/login')}>Sign In</button>
                        <button className="btn btn-primary" onClick={() => navigate('/login?mode=signup')}>Get Started Free</button>
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
                        Trusted by 50,000+ patients worldwide
                    </div>
                    <h1 className="hero-title">
                        Understand Your<br />
                        <span className="hero-title-accent">Medical Reports</span><br />
                        Instantly
                    </h1>
                    <p className="hero-subtitle">
                        Upload any medical report and get a clear, jargon-free summary in seconds.
                        No more confusion. Just answers.
                    </p>
                    <div className="hero-cta">
                        <button className="btn btn-primary btn-lg hero-cta-primary" onClick={() => navigate('/login?mode=signup')}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            Start for Free — No Credit Card
                        </button>
                        <button className="btn btn-outline btn-lg" onClick={() => navigate('/login')}>
                            Sign In to Dashboard
                        </button>
                    </div>
                    <div className="hero-stats">
                        {stats.map(s => (
                            <div key={s.label} className="hero-stat">
                                <span className="hero-stat-value">{s.value}</span>
                                <span className="hero-stat-label">{s.label}</span>
                            </div>
                        ))}
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
                        <span className="section-eyebrow">Why MED Clarity</span>
                        <h2 className="section-heading">Everything you need to take<br />control of your health</h2>
                        <p className="section-desc">Built with patients in mind, powered by cutting-edge AI.</p>
                    </div>
                    <div className="features-grid">
                        {features.map(f => (
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
                        <span className="section-eyebrow">How It Works</span>
                        <h2 className="section-heading">From upload to insight<br />in four simple steps</h2>
                    </div>
                    <div className="steps-grid">
                        {steps.map((s, i) => (
                            <div key={s.num} className="step-card">
                                <div className="step-num">{s.num}</div>
                                {i < steps.length - 1 && <div className="step-connector" />}
                                <h3 className="step-title">{s.title}</h3>
                                <p className="step-desc">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS ── */}
            {testimonials.length > 0 && (
                <section id="testimonials" className="landing-section">
                    <div className="landing-section-inner">
                        <div className="section-header">
                            <span className="section-eyebrow">Testimonials</span>
                            <h2 className="section-heading">Loved by patients &amp; doctors</h2>
                        </div>
                        <div className="testimonials-grid">
                            {testimonials.map(t => (
                                <div key={t.name} className="testimonial-card">
                                    <div className="testimonial-quote">"</div>
                                    <p className="testimonial-text">{t.text}</p>
                                    <div className="testimonial-author">
                                        <div className="testimonial-avatar">{t.avatar}</div>
                                        <div>
                                            <div className="testimonial-name">{t.name}</div>
                                            <div className="testimonial-role">{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── CTA BANNER ── */}
            <section className="cta-banner">
                <div className="cta-banner-orb" />
                <h2 className="cta-banner-title">Ready to understand your health?</h2>
                <p className="cta-banner-desc">Join thousands of patients who've taken control of their health data.</p>
                <button className="btn btn-lg cta-banner-btn" onClick={() => navigate('/login?mode=signup')}>
                    Get Started — It's Free
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
                    <p className="landing-footer-copy">© 2025 MED Clarity. All rights reserved. Made with ❤️ for better health.</p>
                </div>
            </footer>
        </div>
    );
}
