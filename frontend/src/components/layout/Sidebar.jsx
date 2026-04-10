import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Upload, ClipboardList, History,
    Stethoscope, Settings, Info, Activity, LogOut, Globe, User
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

export default function Sidebar() {
    const { language, setLanguage, t } = useLanguage();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            navigate('/landing');
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    const navItems = [
        {
            label: t('common.main'), items: [
                { to: '/dashboard', icon: LayoutDashboard, label: t('common.dashboard') },
                { to: '/upload', icon: Upload, label: t('common.upload_report') },
                { to: '/scan-upload', icon: Activity, label: t('common.scan_analysis') },
                { to: '/results', icon: ClipboardList, label: t('common.my_results') },
                { to: '/history', icon: History, label: t('common.history') },
            ]
        },
        {
            label: t('common.services'), items: [
                { to: '/doctors', icon: Stethoscope, label: t('common.find_doctors') },
            ]
        },
        {
            label: t('common.account'), items: [
                { to: '/profile', icon: User, label: t('common.profile') },
                { to: '/settings', icon: Settings, label: t('common.settings') },
                { to: '/about', icon: Info, label: t('common.about') },
            ]
        },
    ];

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    <Activity size={20} color="white" />
                </div>
                <div className="sidebar-logo-text">
                    MED <span>Clarity</span>
                </div>
            </div>

            {/* Language Selector */}
            <div style={{ padding: '0 1.25rem 1.25rem' }}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    fontSize: '0.75rem', 
                    fontWeight: '600', 
                    color: 'var(--text-muted)',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    <Globe size={12} /> {t('common.select_language')}
                </div>
                <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--primary-light)',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        color: 'var(--primary)',
                        fontWeight: '500'
                    }}
                >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="mr">मराठी (Marathi)</option>
                </select>
            </div>

            {/* Navigation (Profile removed from top absolute) */}
            <nav className="sidebar-nav">
                {navItems.map((section) => (
                    <div key={section.label}>
                        <div className="sidebar-section-label">{section.label}</div>
                        {section.items.map(({ to, icon: Icon, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={to === '/dashboard'}
                                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                            >
                                <Icon size={18} className="nav-icon" />
                                {label}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            {/* Bottom: Sign Out + Profile Swapped */}
            <div className="sidebar-bottom" style={{ 
                padding: '1.25rem 0.75rem',
                borderTop: '1px solid var(--border)',
                marginTop: 'auto'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'var(--primary-light)',
                    padding: '0.5rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border)'
                }}>
                    <button 
                        className="btn btn-ghost" 
                        style={{ 
                            flex: 1, 
                            justifyContent: 'center', 
                            padding: '0.4rem',
                            gap: '0.4rem',
                            fontSize: '0.8rem',
                            background: 'transparent',
                            color: 'var(--primary)',
                            fontWeight: 600
                        }}
                        onClick={handleLogout}
                    >
                        <LogOut size={14} />
                        <span>{t('common.sign_out')}</span>
                    </button>

                    {/* Minimal Profile Circle (now on the right) */}
                    <div 
                        onClick={() => navigate('/profile')}
                        style={{ 
                            width: 34, height: 34, borderRadius: '50%', 
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', flexShrink: 0,
                            border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        title={currentUser?.displayName || t('common.profile')}
                    >
                        {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : (currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U')}
                    </div>
                </div>
            </div>
        </aside>
    );
}
