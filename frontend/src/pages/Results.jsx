import { useState } from 'react';
import { Volume2, RefreshCw, FileText, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { HealthScore, Badge } from '../components/ui/index.jsx';
import { Link } from 'react-router-dom';

// Sample result data — will be replaced by real API response in Phase 2
const SAMPLE_RESULT = {
    reportName: 'Blood_Test_Report.pdf',
    date: 'Feb 21, 2026',
    type: 'Blood Report',
    status: 'normal',
    score: 82,
    summary: 'Your blood test results are mostly within normal range. Hemoglobin (14.2 g/dL), WBC (7,200/µL), and Platelets (1,90,000/µL) are all normal. Fasting Blood Sugar (98 mg/dL) is within range. Cholesterol (195 mg/dL) is borderline — a slight lifestyle adjustment is recommended.',
    keyFindings: [
        { label: 'Hemoglobin', value: '14.2 g/dL', status: 'normal', note: 'Normal range: 13–17 g/dL' },
        { label: 'WBC Count', value: '7,200 /µL', status: 'normal', note: 'Normal range: 4,500–11,000' },
        { label: 'Platelets', value: '1,90,000 /µL', status: 'normal', note: 'Normal range: 1.5–4.5 Lakh' },
        { label: 'Blood Sugar', value: '98 mg/dL', status: 'normal', note: 'Fasting. Normal: <100 mg/dL' },
        { label: 'Cholesterol', value: '195 mg/dL', status: 'warning', note: 'Borderline. Ideal: <200 mg/dL' },
        { label: 'Creatinine', value: '1.1 mg/dL', status: 'normal', note: 'Normal range: 0.7–1.3 mg/dL' },
    ],
    suggestions: [
        'Reduce consumption of fried and processed foods to lower cholesterol.',
        'Include 30 minutes of moderate exercise (walking/cycling) 5 days a week.',
        'Increase intake of fruits, vegetables, and whole grains.',
        'Stay hydrated — drink 8–10 glasses of water daily.',
        'Schedule a follow-up cholesterol check in 3 months.',
    ],
    specialist: null,
};

const statusColors = { normal: 'success', warning: 'warning', error: 'error' };
const riskColors = { normal: 'success', moderate: 'warning', high: 'error' };

export default function Results() {
    const [lang, setLang] = useState('en');
    const r = SAMPLE_RESULT;

    const speak = () => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(r.summary);
            utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Text-to-speech is not supported in your browser.');
        }
    };

    return (
        <>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Analysis Results</h1>
                    <p>{r.reportName} · {r.date}</p>
                </div>
                <div className="flex-gap">
                    <select value={lang} onChange={e => setLang(e.target.value)}
                        style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', background: 'white', cursor: 'pointer' }}>
                        <option value="en">🇬🇧 English</option>
                        <option value="hi">🇮🇳 हिंदी</option>
                    </select>
                    <button className="btn btn-outline" onClick={speak}>
                        <Volume2 size={16} /> Listen
                    </button>
                    <Link to="/upload" className="btn btn-primary">
                        <RefreshCw size={15} /> New Report
                    </Link>
                </div>
            </div>

            <div className="page-body animate-fade-up">
                {/* Top row */}
                <div className="grid-2 mb-4">
                    {/* Score card */}
                    <div className="card card-p" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <HealthScore score={r.score} size={130} />
                        <div>
                            <p className="text-muted text-sm mb-1">Overall Health Status</p>
                            <Badge type={riskColors[r.status]} dot style={{ fontSize: '1rem', padding: '0.35rem 0.875rem' }}>
                                {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                            </Badge>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.75rem', lineHeight: '1.5', maxWidth: 260 }}>
                                Your health score is <strong style={{ color: 'var(--text)' }}>{r.score}/100</strong>. Minor improvements in diet and exercise can help raise this score.
                            </p>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="card card-p">
                        <div className="flex-between mb-2">
                            <h2 className="section-title" style={{ marginBottom: 0 }}>Simple Summary</h2>
                            <Info size={16} color="var(--text-muted)" />
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>{r.summary}</p>
                        <button className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }} onClick={speak}>
                            <Volume2 size={14} /> Read Aloud
                        </button>
                    </div>
                </div>

                {/* Key Findings */}
                <div className="mb-4">
                    <h2 className="section-title">Key Findings</h2>
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Test / Parameter</th>
                                    <th>Your Value</th>
                                    <th>Status</th>
                                    <th>What It Means</th>
                                </tr>
                            </thead>
                            <tbody>
                                {r.keyFindings.map((f) => (
                                    <tr key={f.label}>
                                        <td style={{ fontWeight: '600' }}>{f.label}</td>
                                        <td style={{ fontWeight: '700', fontVariantNumeric: 'tabular-nums' }}>{f.value}</td>
                                        <td>
                                            <Badge type={statusColors[f.status]} dot>
                                                {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                                            </Badge>
                                        </td>
                                        <td className="text-muted text-sm">{f.note}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Suggestions */}
                <div className="grid-2">
                    <div className="card card-p">
                        <h2 className="section-title mb-2">Personalized Suggestions</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {r.suggestions.map((s, i) => (
                                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                    <CheckCircle size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{s}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Next steps */}
                        <div className="card card-p">
                            <h2 className="section-title mb-2">Recommended Actions</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <Link to="/doctors" className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
                                    🩺 Find a nearby specialist
                                </Link>
                                <Link to="/history" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                    📋 Compare with past reports
                                </Link>
                                <Link to="/upload" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
                                    📤 Upload another report
                                </Link>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div style={{
                            background: '#fffbeb', border: '1px solid rgba(217,119,6,0.2)',
                            borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
                            display: 'flex', gap: '0.75rem',
                        }}>
                            <AlertTriangle size={16} color="var(--warning)" style={{ flexShrink: 0, marginTop: 2 }} />
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                <strong style={{ color: 'var(--text)' }}>Disclaimer:</strong> This analysis is AI-generated for informational purposes only. Always consult a qualified doctor for medical decisions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
