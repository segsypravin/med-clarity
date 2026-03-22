import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Login() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '' });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('mode') === 'signup') setMode('signup');
    }, [location.search]);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = e => {
        e.preventDefault();
        setLoading(true);
        // Simulate auth — replace with real API call
        setTimeout(() => {
            setLoading(false);
            navigate('/dashboard');
        }, 1500);
    };

    return (
        <div className="login-page">
            {/* Left panel */}
            <div className="login-left">
                <div className="login-left-bg-orb login-orb-1" />
                <div className="login-left-bg-orb login-orb-2" />

                {/* Logo */}
                <button className="login-back-logo" onClick={() => navigate('/landing')}>
                    <div className="landing-logo-icon" style={{ width: 32, height: 32 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </div>
                    <span className="landing-logo-text" style={{ fontSize: '1.25rem' }}>MED<span>Clarity</span></span>
                </button>

                {/* Illustration content */}
                <div className="login-left-content">
                    <h2 className="login-left-title">{t('login.left_title', { defaultValue: 'Your health, finally clear and simple.' })}</h2>
                    <p className="login-left-desc">
                        {t('login.left_desc', { defaultValue: 'Upload any medical report and get instant, AI-powered summaries in plain English.' })}
                    </p>

                    {/* Mini feature list */}
                    <div className="login-features">
                        {[
                            ['⚡', t('login.feat_instant')],
                            ['🔒', t('login.feat_secure')],
                            ['👨‍⚕️', t('login.feat_doctors')],
                            ['📈', t('login.feat_track')],
                        ].map(([icon, text]) => (
                            <div key={text} className="login-feature-item">
                                <span className="login-feature-icon">{icon}</span>
                                <span>{text}</span>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            {/* Right panel — Auth form */}
            <div className="login-right">
                <div className="login-form-wrap">
                    {/* Tab switch */}
                    <div className="login-tabs">
                        <button
                            className={`login-tab${mode === 'signin' ? ' active' : ''}`}
                            onClick={() => setMode('signin')}
                        >
                            {t('landing.sign_in')}
                        </button>
                        <button
                            className={`login-tab${mode === 'signup' ? ' active' : ''}`}
                            onClick={() => setMode('signup')}
                        >
                            {t('login.create_account')}
                        </button>
                    </div>

                    <div className="login-form-header">
                        <h1 className="login-form-title">
                            {mode === 'signin' ? `${t('login.welcome')} 👋` : `${t('login.get_started_free')} 🚀`}
                        </h1>
                        <p className="login-form-subtitle">
                            {mode === 'signin'
                                ? t('login.sign_in_to_access')
                                : t('login.signup_subtitle')}
                        </p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        {mode === 'signup' && (
                            <div className="form-group">
                                <label htmlFor="name">{t('login.full_name')}</label>
                                <div className="input-icon-wrap">
                                    <span className="input-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                    </span>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="John Doe"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email">{t('login.email')}</label>
                            <div className="input-icon-wrap">
                                <span className="input-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                </span>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="flex-between" style={{ marginBottom: '0.4rem' }}>
                                <label htmlFor="password" style={{ marginBottom: 0 }}>{t('login.password')}</label>
                                {mode === 'signin' && (
                                    <a href="#" className="login-forgot">{t('login.forgot_password')}</a>
                                )}
                            </div>
                            <div className="input-icon-wrap">
                                <span className="input-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                </span>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPass ? 'text' : 'password'}
                                    placeholder={mode === 'signup' ? t('login.password_placeholder_signup', { defaultValue: 'Min. 8 characters' }) : '••••••••'}
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    minLength={8}
                                />
                                <button type="button" className="input-icon-right" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                                    {showPass ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {mode === 'signup' && (
                            <div className="login-terms">
                                <input type="checkbox" id="terms" required />
                                <label htmlFor="terms" style={{ display: 'inline', fontWeight: 400, fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                                    &nbsp;{t('login.agree_to')} <a href="#" className="login-forgot">{t('login.terms')}</a> {t('common.and', { defaultValue: 'and' })} <a href="#" className="login-forgot">{t('login.privacy')}</a>
                                </label>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%', marginTop: '0.5rem' }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
                                    {t('login.please_wait')}
                                </>
                            ) : mode === 'signin' ? t('login.sign_in_to_dash') : t('login.create_my_account')}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="login-divider">
                        <span>{t('login.or_continue_with')}</span>
                    </div>

                    {/* Social buttons */}
                    <div className="login-social">
                        <button className="login-social-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                            Google
                        </button>
                        <button className="login-social-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            Facebook
                        </button>
                    </div>

                    <p className="login-switch">
                        {mode === 'signin' ? t('login.dont_have_account') : t('login.already_have_account')}
                        <button
                            className="login-switch-link"
                            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                        >
                            {mode === 'signin' ? t('login.sign_up_free') : t('landing.sign_in')}
                        </button>
                    </p>

                    {/* Back to landing */}
                    <button className="login-back" onClick={() => navigate('/landing')}>
                        {t('login.back_to_home')}
                    </button>
                </div>
            </div>
        </div>
    );
}
