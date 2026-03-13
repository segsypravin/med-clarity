import { useState } from 'react';
import { Volume2, RefreshCw, FileText, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { HealthScore, Badge } from '../components/ui/index.jsx';
import { Link, useLocation } from 'react-router-dom';

// Replaced dummy data with null
const SAMPLE_RESULT = null;

export default function Results() {
    const location = useLocation();
    const data = location.state?.result;

    // Result data from OCR API
    const r = data || SAMPLE_RESULT;

    return (
        <>
            {!r ? (
                <div className="page-body animate-fade-up" style={{ textAlign: 'center', padding: '6rem 1rem' }}>
                    <AlertTriangle size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                    <h2 style={{ marginBottom: '0.5rem' }}>No Analysis Found</h2>
                    <p className="text-muted" style={{ maxWidth: 400, margin: '0 auto 1.5rem' }}>
                        You haven't uploaded or selected any report to analyze. Please upload a medical report to view its insights.
                    </p>
                    <Link to="/upload" className="btn btn-primary">
                        <FileText size={16} /> Go to Upload
                    </Link>
                </div>
            ) : (
                <>
                    <div className="page-header">
                        <div className="page-header-left">
                            <h1>Extracted Report Text</h1>
                            <p>Raw text extracted from your report using OCR.</p>
                        </div>
                        <div className="flex-gap">
                            <Link to="/upload" className="btn btn-primary">
                                <RefreshCw size={15} /> New Report
                            </Link>
                        </div>
                    </div>

                    <div className="page-body animate-fade-up">
                        <div className="card card-p" style={{ backgroundColor: '#fafafa', border: '1px solid #e5e7eb' }}>
                            <div className="flex-between mb-3" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>
                                <h2 className="section-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={18} /> Raw OCR output
                                </h2>
                                <Badge type="success">Extraction Success</Badge>
                            </div>

                            <div style={{
                                whiteSpace: 'pre-wrap',
                                fontFamily: 'monospace',
                                fontSize: '0.9rem',
                                color: '#374151',
                                lineHeight: '1.6',
                                padding: '1rem',
                                backgroundColor: '#ffffff',
                                borderRadius: '6px',
                                border: '1px dashed #d1d5db',
                                minHeight: '300px'
                            }}>
                                {r.extracted_text || "No text could be extracted from this document."}
                            </div>

                        </div>
                    </div>
                </>
            )}
        </>
    );
}
