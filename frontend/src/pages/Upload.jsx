import UploadArea from '../components/UploadArea';
import { FileText, Image as ImageIcon, Scan, Droplets } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Upload() {
    const { t } = useLanguage();

    const fileTypes = [
        { icon: FileText, label: t('upload.file_types.medical_reports'), desc: t('upload.file_types.medical_reports_desc') },
        { icon: Scan, label: t('upload.file_types.ct_scans'), desc: t('upload.file_types.ct_scans_desc') },
        { icon: ImageIcon, label: t('upload.file_types.xray_images'), desc: t('upload.file_types.xray_images_desc') },
        { icon: Droplets, label: t('upload.file_types.other_reports'), desc: t('upload.file_types.other_reports_desc') },
    ];
    
    return (
        <>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>{t('upload.title')}</h1>
                    <p>{t('upload.subtitle')}</p>
                </div>
            </div>

            <div className="page-body animate-fade-up">
                <div className="grid-2" style={{ alignItems: 'start' }}>
                    {/* Upload Panel */}
                    <div className="card card-p-lg">
                        <h2 className="section-title mb-3">{t('upload.upload_your_report')}</h2>
                        <UploadArea />
                    </div>

                    {/* Info Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Supported types */}
                        <div className="card card-p">
                            <h3 className="section-title mb-2">{t('upload.supported_types')}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {fileTypes.map(({ icon: Icon, label, desc }) => (
                                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--error-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Icon size={16} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{label}</div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* How it works */}
                        <div className="card card-p">
                            <h3 className="section-title mb-2">{t('upload.how_it_works')}</h3>
                            {(t('upload.steps', { returnObjects: true }) || []).map((text, i) => (
                                <div key={i} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                    <div style={{
                                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.72rem', fontWeight: '700',
                                    }}>{i + 1}</div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', paddingTop: '0.2rem' }}>{text}</p>
                                </div>
                            ))}
                        </div>

                        {/* Privacy note */}
                        <div style={{
                            background: 'var(--primary-light)', border: '1px solid var(--border-red)',
                            borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
                            display: 'flex', gap: '0.75rem',
                        }}>
                            <span style={{ fontSize: '1.25rem' }}>🔒</span>
                            <div>
                                <p style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.2rem', color: 'var(--primary)' }}>{t('upload.secure_note_title')}</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                    {t('upload.secure_note_desc')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
