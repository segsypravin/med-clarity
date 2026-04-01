import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [mode, setMode] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('mode') === 'signup' ? 'signup' : 'signin';
    }); // 'signin' | 'signup'
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '' });



    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === 'signup') {
                await createUserWithEmailAndPassword(auth, form.email, form.password);
                // Can also save form.name to profile or firestore here if needed
            } else {
                await signInWithEmailAndPassword(auth, form.email, form.password);
            }
            navigate('/dashboard');
        } catch (error) {
            console.error(error.message);
            alert(error.message);
        } finally {
            setLoading(false);
        }
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

                    {/* Removed placeholder social login buttons to prevent confusion */}

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
