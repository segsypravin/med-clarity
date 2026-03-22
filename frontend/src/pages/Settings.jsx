import { useState } from 'react';
import { Globe, Volume2, Accessibility, Bell, Shield, Smartphone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const SECTION = ({ title, icon: Icon, children }) => (
    <div className="card card-p mb-3">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ width: 36, height: 36, background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} />
            </div>
            <h2 className="section-title" style={{ marginBottom: 0 }}>{title}</h2>
        </div>
        {children}
    </div>
);

function ToggleRow({ label, description, checked, onChange }) {
    return (
        <div className="toggle-row">
            <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{label}</div>
                {description && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{description}</div>}
            </div>
            <label className="toggle">
                <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
                <span className="toggle-slider" />
            </label>
        </div>
    );
}

export default function Settings() {
    const { language, setLanguage, audioSettings, updateAudioSettings, t } = useLanguage();

    return (
        <>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>{t('settings.title')}</h1>
                    <p>{t('settings.subtitle')}</p>
                </div>
                <button className="btn btn-primary" onClick={() => alert('Settings saved!')}>
                    {t('settings.save_changes')}
                </button>
            </div>

            <div className="page-body animate-fade-up" style={{ maxWidth: 720 }}>
                {/* Language */}
                <SECTION title={t('settings.language')} icon={Globe}>
                    <div className="form-group">
                        <label>{t('settings.display_language')}</label>
                        <select value={language} onChange={e => setLanguage(e.target.value)}>
                            <option value="en">🇬🇧 {t('common.english')}</option>
                            <option value="hi">🇮🇳 {t('common.hindi')} (हिंदी)</option>
                            <option value="mr">🇮🇳 {t('common.marathi')} (मराठी)</option>
                        </select>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                            {t('settings.more_languages')}
                        </p>
                    </div>
                </SECTION>

                {/* Audio / TTS */}
                <SECTION title={t('settings.audio')} icon={Volume2}>
                    <ToggleRow 
                        label={t('settings.enable_audio')} 
                        description={t('settings.enable_audio_desc')} 
                        checked={audioSettings.enabled}
                        onChange={(enabled) => updateAudioSettings({ enabled })}
                    />
                    <ToggleRow 
                        label={t('settings.autoplay')} 
                        description={t('settings.autoplay_desc')} 
                        checked={audioSettings.autoplay}
                        onChange={(autoplay) => updateAudioSettings({ autoplay })}
                    />
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label>{t('settings.speech_speed')}</label>
                        <select value={audioSettings.speed} onChange={(e) => updateAudioSettings({ speed: e.target.value })}>
                            <option value="slow">{t('settings.slow')}</option>
                            <option value="normal">{t('settings.normal')}</option>
                            <option value="fast">{t('settings.fast')}</option>
                        </select>
                    </div>
                </SECTION>

                {/* Accessibility */}
                <SECTION title={t('settings.accessibility')} icon={Accessibility}>
                    <ToggleRow label={t('settings.large_text')} description={t('settings.large_text_desc')} />
                    <ToggleRow label={t('settings.high_contrast')} description={t('settings.high_contrast_desc')} />
                    <ToggleRow label={t('settings.simplified')} description={t('settings.simplified_desc')} checked={true} />
                </SECTION>

                {/* Notifications */}
                <SECTION title={t('settings.notifications')} icon={Bell}>
                    <ToggleRow label={t('settings.alerts')} description={t('settings.alerts_desc')} defaultChecked={true} />
                    <ToggleRow label={t('settings.health_reminders')} description={t('settings.health_reminders_desc')} />
                    <ToggleRow label={t('settings.apt_reminders')} description={t('settings.apt_reminders_desc')} defaultChecked={true} />
                </SECTION>

                {/* Privacy */}
                <SECTION title={t('settings.privacy')} icon={Shield}>
                    <ToggleRow label={t('settings.secure_storage')} description={t('settings.secure_storage_desc')} defaultChecked={true} />
                    <ToggleRow label={t('settings.anonymous')} description={t('settings.anonymous_desc')} />
                    <div style={{ marginTop: '0.75rem' }}>
                        <button className="btn btn-sm" style={{ background: 'var(--error-bg)', color: 'var(--error)', border: 'none', fontWeight: '600' }}
                            onClick={() => confirm('Are you sure? This will delete all your local data.') && alert('Data cleared.')}>
                            {t('settings.clear_data')}
                        </button>
                    </div>
                </SECTION>

                {/* App Info */}
                <SECTION title={t('settings.application')} icon={Smartphone}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        {[
                            [t('settings.app_name'), 'MED Clarity'],
                            [t('settings.version'), '1.0.0 (Phase 1)'],
                            [t('settings.platform'), 'Web Application'],
                            [t('settings.backend'), 'Node.js + Express'],
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
