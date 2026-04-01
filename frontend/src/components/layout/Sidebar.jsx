import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Upload, ClipboardList, History,
    Stethoscope, Settings, Info, Activity, LogOut, Globe
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

export default function Sidebar() {
    const { language, setLanguage, t } = useLanguage();
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

            {/* Navigation */}
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

            {/* Bottom */}
            <div className="sidebar-bottom">
                <button 
                    className="btn btn-ghost" 
                    style={{ width: '100%', justifyContent: 'flex-start', gap: '0.75rem' }}
                    onClick={handleLogout}
                >
                    <LogOut size={16} />
                    <span style={{ fontSize: '0.875rem' }}>{t('common.sign_out')}</span>
                </button>
            </div>
        </aside>
    );
}
