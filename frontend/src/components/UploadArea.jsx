import { useState, useRef } from 'react';
import { Upload, FileText, Image, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Spinner } from './ui/index.jsx';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { auth } from '../firebase';

const ACCEPTED_TYPES = {
    'application/pdf': { label: 'PDF Report', icon: FileText },
    'image/jpeg': { label: 'Image / Scan', icon: Image },
    'image/png': { label: 'Image / Scan', icon: Image },
    'image/jpg': { label: 'Image / Scan', icon: Image },
};

export default function UploadArea({ onSuccess }) {
    const { language, t } = useLanguage();
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleDragOver = (e) => { e.preventDefault(); setIsDragActive(true); };
    const handleDragLeave = () => setIsDragActive(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragActive(false);
        if (e.dataTransfer.files?.[0]) pickFile(e.dataTransfer.files[0]);
    };

    const handleFileSelect = (e) => {
        if (e.target.files?.[0]) pickFile(e.target.files[0]);
    };

    const pickFile = (f) => { setFile(f); setStatus('idle'); setMessage(''); };

    const handleUpload = async () => {
        if (!file) return;
        setStatus('uploading');
        setMessage(t('common.processing'));
        const formData = new FormData();
        formData.append('report', file);
        try {
            const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
            const res = await fetch('http://localhost:5000/api/upload', { 
                method: 'POST', 
                body: formData,
                headers: { ...(token && { Authorization: `Bearer ${token}` }) } 
            });
            const data = await res.json();
            if (res.ok) {
                // Post upload success, now trigger analyze
                setMessage(t('common.processing'));

                const analyzeRes = await fetch('http://localhost:5000/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
                    body: JSON.stringify({ 
                        reportId: data.file.id, 
                        filename: data.file.filename,
                        lang: language 
                    })
                });

                const analyzeData = await analyzeRes.json();

                if (analyzeRes.ok) {
                    // 🎉 Sync with History API (Phase 1 In-Memory)
                    try {
                        await fetch('http://localhost:5000/api/history', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
                            body: JSON.stringify({
                                name: data.file.originalName,
                                filename: data.file.filename,
                                date: new Date().toLocaleDateString(),
                                type: 'Blood Report',
                                status: (analyzeData.overall_status || 'Normal').toLowerCase(),
                                score: analyzeData.health_score || 75,
                                size: (data.file.size / 1024).toFixed(1) + ' KB',
                                result: analyzeData // Full AI output for Results page viewing later
                            })
                        });
                    } catch (historyErr) {
                        console.error("Failed to save to history:", historyErr);
                    }

                    setStatus('success');
                    setMessage(t('common.success'));
                    onSuccess?.({ ...data, analyze: analyzeData });
                    navigate('/results', { state: { result: analyzeData, lang: language } });
                } else {
                    setStatus('error');
                    setMessage(analyzeData.message || t('common.error'));
                }
            } else {
                setStatus('error');
                setMessage(data.message || t('common.error'));
            }
        } catch {
            setStatus('error');
            setMessage('Cannot reach server.');
        }
    };

    const reset = () => { setFile(null); setStatus('idle'); setMessage(''); };

    const FileIcon = file ? (ACCEPTED_TYPES[file.type]?.icon ?? FileText) : null;

    return (
        <div>
            {/* Drop zone */}
            <div
                className={`upload-area${isDragActive ? ' drag-active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
                style={{ cursor: file ? 'default' : 'pointer' }}
            >
                <input ref={fileInputRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFileSelect} />

                {file ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                            width: 60, height: 60, background: 'var(--primary-light)',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--primary)', marginBottom: '0.5rem',
                        }}>
                            <FileIcon size={28} />
                        </div>
                        <p style={{ fontWeight: '600', fontSize: '1rem' }}>{file.name}</p>
                        <p className="text-muted text-sm">
                            {ACCEPTED_TYPES[file.type]?.label ?? 'File'} · {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button className="btn btn-ghost btn-sm" style={{ marginTop: '0.5rem', color: 'var(--error)' }} onClick={(e) => { e.stopPropagation(); reset(); }}>
                            <X size={14} /> {t('upload.remove')}
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="upload-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                            <Upload size={44} />
                        </div>
                        <p style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.4rem' }}>
                            {t('upload.dropzone_title')}
                        </p>
                        <p className="text-muted text-sm">{t('upload.dropzone_subtitle')}</p>
                        <button className="btn btn-outline" style={{ marginTop: '1.25rem' }} onClick={() => fileInputRef.current?.click()}>
                            {t('upload.browse')}
                        </button>
                    </div>
                )}
            </div>

            {/* Action / feedback */}
            <div style={{ marginTop: '1.25rem' }}>
                {status === 'idle' && (
                    <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleUpload} disabled={!file}>
                        {file ? `${t('common.analyze_report')} →` : t('common.select_language')}
                    </button>
                )}

                {status === 'uploading' && (
                    <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled>
                        <Spinner size={18} /> {message}
                    </button>
                )}

                {status === 'success' && (
                    <div className="animate-fade-up">
                        <div style={{
                            background: 'var(--success-bg)', color: 'var(--success)',
                            border: '1px solid rgba(5,150,105,0.2)', borderRadius: 'var(--radius-sm)',
                            padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                            marginBottom: '0.75rem', fontWeight: '500',
                        }}>
                            <CheckCircle size={18} /> {message}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <button className="btn btn-primary" onClick={() => navigate('/results')}>{t('common.my_results')} →</button>
                            <button className="btn btn-outline" onClick={reset}>Upload Another</button>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="animate-fade-up">
                        <div style={{
                            background: 'var(--error-bg)', color: 'var(--error)',
                            border: '1px solid rgba(192,21,42,0.2)', borderRadius: 'var(--radius-sm)',
                            padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                            marginBottom: '0.75rem', fontWeight: '500',
                        }}>
                            <AlertCircle size={18} /> {message}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <button className="btn btn-primary" onClick={handleUpload}>Try Again</button>
                            <button className="btn btn-outline" onClick={reset}>Change File</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
