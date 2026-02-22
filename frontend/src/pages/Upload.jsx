import UploadArea from '../components/UploadArea';
import { FileText, Image as ImageIcon, Scan, Droplets } from 'lucide-react';

const fileTypes = [
    { icon: FileText, label: 'Medical Reports', desc: 'Blood tests, lab reports (PDF)' },
    { icon: Scan, label: 'CT Scans', desc: 'CT scan images (JPG/PNG)' },
    { icon: ImageIcon, label: 'X-Ray Images', desc: 'Chest, bone X-rays (JPG/PNG)' },
    { icon: Droplets, label: 'Other Reports', desc: 'MRI, ultrasound, etc.' },
];

export default function Upload() {
    return (
        <>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Upload Report</h1>
                    <p>Upload a medical report or scan image for AI analysis.</p>
                </div>
            </div>

            <div className="page-body animate-fade-up">
                <div className="grid-2" style={{ alignItems: 'start' }}>
                    {/* Upload Panel */}
                    <div className="card card-p-lg">
                        <h2 className="section-title mb-3">Upload Your Report</h2>
                        <UploadArea />
                    </div>

                    {/* Info Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Supported types */}
                        <div className="card card-p">
                            <h3 className="section-title mb-2">Supported Report Types</h3>
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
                            <h3 className="section-title mb-2">How It Works</h3>
                            {[
                                ['1', 'Upload your report or scan image'],
                                ['2', 'OCR extracts text from the document'],
                                ['3', 'AI analyzes the health data'],
                                ['4', 'Get a simple summary + health score'],
                                ['5', 'Receive personalized suggestions'],
                            ].map(([n, text]) => (
                                <div key={n} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                    <div style={{
                                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.72rem', fontWeight: '700',
                                    }}>{n}</div>
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
                                <p style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.2rem', color: 'var(--primary)' }}>Your data is secure</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                    Reports are processed securely. Files are not shared with third parties.
                                    All communication is encrypted.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
