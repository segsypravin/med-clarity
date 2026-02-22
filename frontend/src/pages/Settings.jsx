import { useState } from 'react';
import { Globe, Volume2, Accessibility, Bell, Shield, Smartphone } from 'lucide-react';

const SECTION = ({ title, icon: Icon, children }) => (
    <div className="card card-p mb-3">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ width: 36, height: 36, background: 'var(--error-bg)', color: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} />
            </div>
            <h2 className="section-title" style={{ marginBottom: 0 }}>{title}</h2>
        </div>
        {children}
    </div>
);

function ToggleRow({ label, description, defaultChecked = false }) {
    const [on, setOn] = useState(defaultChecked);
    return (
        <div className="toggle-row">
            <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{label}</div>
                {description && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{description}</div>}
            </div>
            <label className="toggle">
                <input type="checkbox" checked={on} onChange={e => setOn(e.target.checked)} />
                <span className="toggle-slider" />
            </label>
        </div>
    );
}

export default function Settings() {
    const [lang, setLang] = useState('en');

    return (
        <>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Settings</h1>
                    <p>Customize your MED Clarity experience.</p>
                </div>
                <button className="btn btn-primary" onClick={() => alert('Settings saved!')}>
                    Save Changes
                </button>
            </div>

            <div className="page-body animate-fade-up" style={{ maxWidth: 720 }}>
                {/* Language */}
                <SECTION title="Language" icon={Globe}>
                    <div className="form-group">
                        <label>Display Language</label>
                        <select value={lang} onChange={e => setLang(e.target.value)}>
                            <option value="en">🇬🇧 English</option>
                            <option value="hi">🇮🇳 Hindi (हिंदी)</option>
                        </select>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                            More regional languages (Tamil, Telugu, Bengali, Marathi) coming in Phase 3.
                        </p>
                    </div>
                </SECTION>

                {/* Audio / TTS */}
                <SECTION title="Audio & Text-to-Speech" icon={Volume2}>
                    <ToggleRow label="Enable Audio Output" description="Read health summaries aloud using text-to-speech." defaultChecked={true} />
                    <ToggleRow label="Auto-play on Results" description="Automatically read results when analysis is complete." />
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label>Speech Speed</label>
                        <select defaultValue="normal">
                            <option value="slow">Slow</option>
                            <option value="normal">Normal</option>
                            <option value="fast">Fast</option>
                        </select>
                    </div>
                </SECTION>

                {/* Accessibility */}
                <SECTION title="Accessibility" icon={Accessibility}>
                    <ToggleRow label="Large Text Mode" description="Increase font size for easier reading." />
                    <ToggleRow label="High Contrast Mode" description="Improve visibility for users with visual impairments." />
                    <ToggleRow label="Simplified Interface" description="Show only essential information (recommended for elderly users)." defaultChecked={true} />
                </SECTION>

                {/* Notifications */}
                <SECTION title="Notifications" icon={Bell}>
                    <ToggleRow label="Analysis Complete Alerts" description="Notify when report analysis is ready." defaultChecked={true} />
                    <ToggleRow label="Health Reminders" description="Weekly health checkup reminders." />
                    <ToggleRow label="Doctor Appointment Reminders" description="Reminders for upcoming appointments." defaultChecked={true} />
                </SECTION>

                {/* Privacy */}
                <SECTION title="Privacy & Security" icon={Shield}>
                    <ToggleRow label="Secure Storage" description="Encrypt locally stored report data." defaultChecked={true} />
                    <ToggleRow label="Anonymous Analytics" description="Help improve MED Clarity with anonymous usage data." />
                    <div style={{ marginTop: '0.75rem' }}>
                        <button className="btn btn-sm" style={{ background: 'var(--error-bg)', color: 'var(--error)', border: 'none', fontWeight: '600' }}
                            onClick={() => confirm('Are you sure? This will delete all your local data.') && alert('Data cleared.')}>
                            Clear All Local Data
                        </button>
                    </div>
                </SECTION>

                {/* App Info */}
                <SECTION title="Application" icon={Smartphone}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        {[
                            ['App Name', 'MED Clarity'],
                            ['Version', '1.0.0 (Phase 1)'],
                            ['Platform', 'Web Application'],
                            ['Backend', 'Node.js + Express'],
                        ].map(([label, value]) => (
                            <div key={label} style={{ padding: '0.75rem', background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{label}</div>
                                <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{value}</div>
                            </div>
                        ))}
                    </div>
                </SECTION>
            </div>
        </>
    );
}
