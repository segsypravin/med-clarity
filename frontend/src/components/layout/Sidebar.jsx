import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Upload, ClipboardList, History,
    Stethoscope, Settings, Info, Activity, LogOut
} from 'lucide-react';

const navItems = [
    {
        label: 'Main', items: [
            { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/upload', icon: Upload, label: 'Upload Report' },
            { to: '/scan-upload', icon: Activity, label: 'Scan Analysis' },
            { to: '/results', icon: ClipboardList, label: 'My Results' },
            { to: '/history', icon: History, label: 'History' },
        ]
    },
    {
        label: 'Services', items: [
            { to: '/doctors', icon: Stethoscope, label: 'Find Doctors' },
        ]
    },
    {
        label: 'Account', items: [
            { to: '/settings', icon: Settings, label: 'Settings' },
            { to: '/about', icon: Info, label: 'About' },
        ]
    },
];

export default function Sidebar() {
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
                <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', gap: '0.75rem' }}>
                    <LogOut size={16} />
                    <span style={{ fontSize: '0.875rem' }}>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
