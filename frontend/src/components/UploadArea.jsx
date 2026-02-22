import { useState, useRef } from 'react';
import { Upload, FileText, Image, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Spinner } from './ui/index.jsx';
import { useNavigate } from 'react-router-dom';

const ACCEPTED_TYPES = {
    'application/pdf': { label: 'PDF Report', icon: FileText },
    'image/jpeg': { label: 'Image / Scan', icon: Image },
    'image/png': { label: 'Image / Scan', icon: Image },
    'image/jpg': { label: 'Image / Scan', icon: Image },
};

export default function UploadArea({ onSuccess }) {
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
        const formData = new FormData();
        formData.append('report', file);
        try {
            const res = await fetch('http://localhost:5000/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (res.ok) {
                setStatus('success');
                setMessage(data.message || 'Report uploaded successfully!');
                onSuccess?.(data);
            } else {
                setStatus('error');
                setMessage(data.message || 'Upload failed.');
            }
        } catch {
            setStatus('error');
            setMessage('Cannot reach server. Make sure the backend is running.');
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
                            <X size={14} /> Remove
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="upload-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                            <Upload size={44} />
                        </div>
                        <p style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.4rem' }}>
                            Drag & drop your report here
                        </p>
                        <p className="text-muted text-sm">PDF, JPG, PNG up to 10 MB · Medical reports, CT scans, X‑rays</p>
                        <button className="btn btn-outline" style={{ marginTop: '1.25rem' }} onClick={() => fileInputRef.current?.click()}>
                            Browse Files
                        </button>
                    </div>
                )}
            </div>

            {/* Action / feedback */}
            <div style={{ marginTop: '1.25rem' }}>
                {status === 'idle' && (
                    <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleUpload} disabled={!file}>
                        {file ? 'Analyze Report →' : 'Select a file first'}
                    </button>
                )}

                {status === 'uploading' && (
                    <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled>
                        <Spinner size={18} /> Uploading…
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
                            <button className="btn btn-primary" onClick={() => navigate('/results')}>View Results →</button>
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
