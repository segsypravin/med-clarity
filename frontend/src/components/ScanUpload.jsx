import React, { useState } from 'react';
import { Upload, FileSearch, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function ScanUpload() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
        setResult(null);
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        setLoading(true);
        setError(null);
        
        const formData = new FormData();
        formData.append("scan", file);

        try {
            const response = await fetch("http://127.0.0.1:3001/scan", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to analyze scan.");
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card card-p-lg animate-fade-up">
            <h2 className="section-title mb-4">Chest X-Ray Analysis</h2>
            
            <div className="upload-container" style={{
                border: '2px dashed var(--border-red)',
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--primary-light)',
                transition: 'all 0.3s ease',
                marginBottom: '1.5rem'
            }}>
                <input
                    type="file"
                    id="scan-upload"
                    hidden
                    onChange={handleFileChange}
                    accept="image/*"
                />
                
                <label htmlFor="scan-upload" style={{ cursor: 'pointer', display: 'block' }}>
                    <div style={{ 
                        width: 64, height: 64, borderRadius: '50%', 
                        background: 'var(--error-bg)', color: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem'
                    }}>
                        <Upload size={32} />
                    </div>
                    <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                        {file ? file.name : "Click to select Chest X-Ray image"}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Supported formats: JPG, PNG
                    </p>
                </label>
            </div>

            <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.875rem' }}
                onClick={handleUpload}
                disabled={loading || !file}
            >
                {loading ? (
                    <><Loader2 className="animate-spin mr-2" size={18} /> Analyzing...</>
                ) : (
                    <><FileSearch size={18} style={{ marginRight: '8px' }} /> Analyze Scan</>
                )}
            </button>

            {error && (
                <div style={{ 
                    marginTop: '1.5rem', padding: '1rem', borderRadius: 'var(--radius)',
                    background: '#FEF2F2', border: '1px solid #FEE2E2', color: '#991B1B',
                    display: 'flex', alignItems: 'center', gap: '0.75rem'
                }}>
                    <AlertCircle size={20} />
                    <span style={{ fontSize: '0.875rem' }}>{error}</span>
                </div>
            )}

            {result && (
                <div style={{ 
                    marginTop: '1.5rem', padding: '1.5rem', borderRadius: 'var(--radius)',
                    background: 'var(--primary-light)', border: '1px solid var(--border-red)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <CheckCircle2 color="var(--primary)" size={24} />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)' }}>Analysis Complete</h3>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="card-p" style={{ backgroundColor: 'white', border: '1px solid var(--border)' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prediction</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-dark)', marginTop: '0.25rem' }}>
                                {result.prediction.charAt(0).toUpperCase() + result.prediction.slice(1)}
                            </p>
                        </div>
                        <div className="card-p" style={{ backgroundColor: 'white', border: '1px solid var(--border)' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confidence</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-dark)', marginTop: '0.25rem' }}>
                                {(result.confidence * 100).toFixed(2)}%
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
