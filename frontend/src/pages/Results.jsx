import { useState, useEffect, useRef } from 'react';
import { Volume2, RefreshCw, FileText, AlertTriangle, Loader2, Info } from 'lucide-react';
import { HealthScore, Badge } from '../components/ui/index.jsx';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSpeech } from '../hooks/useSpeech';
import { auth } from '../firebase';

export default function Results() {
    const location = useLocation();
    const { language: displayLang, t, audioSettings } = useLanguage();
    const { speak, stop, isSpeaking } = useSpeech();

    // Store result in state so we can swap it after on-the-fly translation
    const [result, setResult] = useState(() => {
        const raw = location.state?.result;
        return raw?.result || raw || null;
    });

    const [isTranslating, setIsTranslating] = useState(false);
    // Track the last language we translated to — prevents infinite loops
    const lastTranslatedLang = useRef(result?.lang || 'en');

    // ─── On-the-fly translation whenever the sidebar language changes ──────────
    useEffect(() => {
        if (!result) return;
        if (displayLang === lastTranslatedLang.current) return; // already in this lang

        const translate = async () => {
            setIsTranslating(true);
            try {
                const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
                const res = await fetch('http://localhost:5000/translate_result', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
                    body: JSON.stringify({ data: result, lang: displayLang })
                });
                if (!res.ok) throw new Error('Network error');
                const json = await res.json();
                // Backend returns { status:"success", result: {...} }
                const translated = json.result || json;
                if (translated && translated.summary) {
                    setResult(translated);
                    lastTranslatedLang.current = displayLang;
                }
            } catch (err) {
                console.warn('[Translation] Failed, keeping current language.', err.message);
            } finally {
                setIsTranslating(false);
            }
        };

        translate();
    }, [displayLang]); // eslint-disable-line react-hooks/exhaustive-deps

    // ─── TTS autoplay ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (!result || !audioSettings.enabled || !audioSettings.autoplay || isTranslating) return;
        const text = result.full_report_summary || result.summary_translated || result.summary;
        if (!text) return;
        const timer = setTimeout(() => speak(text), 1200);
        return () => clearTimeout(timer);
    }, [result?.summary, audioSettings.enabled, audioSettings.autoplay, isTranslating]); // eslint-disable-line

    const handleToggleSpeech = () => {
        if (isSpeaking) {
            stop();
        } else {
            const text = result?.full_report_summary || result?.summary_translated || result?.summary;
            if (text) speak(text);
        }
    };

    // Helper: pick translated field if available, otherwise fallback to English
    const txt = (en, translated) =>
        displayLang !== 'en' && translated ? translated : (en || '');

    // ─── No result state ───────────────────────────────────────────────────────
    if (!result) {
        return (
            <div className="page-body animate-fade-up" style={{ textAlign: 'center', padding: '6rem 1rem' }}>
                <AlertTriangle size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                <h2 style={{ marginBottom: '0.5rem' }}>{t('results.no_analysis')}</h2>
                <p className="text-muted" style={{ maxWidth: 400, margin: '0 auto 1.5rem' }}>
                    {t('results.no_analysis_desc')}
                </p>
                <Link to="/upload" className="btn btn-primary">
                    <FileText size={16} /> {t('results.go_to_upload')}
                </Link>
            </div>
        );
    }

    // ─── Results view ──────────────────────────────────────────────────────────
    return (
        <>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>{t('results.title')}</h1>
                    <p>{t('results.subtitle')}</p>
                </div>
                <div className="flex-gap">
                    {isTranslating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                            {displayLang === 'hi' ? 'अनुवाद हो रहा है...' : displayLang === 'mr' ? 'भाषांतर होत आहे...' : 'Translating...'}
                        </div>
                    )}
                    <Link to="/upload" className="btn btn-primary">
                        <RefreshCw size={15} /> {t('results.new_report')}
                    </Link>
                </div>
            </div>

            <div className="page-body animate-fade-up">
                {/* Summary + Score */}
                <div className="flex-gap" style={{ marginBottom: '2rem' }}>
                    <div className="card card-p" style={{ flex: 1, position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Info size={18} color="var(--primary)" /> {t('results.overall_summary')}
                            </h3>
                            {audioSettings.enabled && (
                                <button
                                    className={`btn btn-icon ${isSpeaking ? 'pulse-audio' : ''}`}
                                    onClick={handleToggleSpeech}
                                    disabled={isTranslating}
                                    style={{
                                        background: isSpeaking ? 'var(--primary)' : 'var(--primary-light)',
                                        color: isSpeaking ? '#fff' : 'var(--primary)',
                                        border: 'none', padding: '8px', borderRadius: '50%',
                                        cursor: isTranslating ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s', opacity: isTranslating ? 0.6 : 1
                                    }}
                                    title={isSpeaking ? 'Stop' : 'Read Summary'}
                                >
                                    <Volume2 size={18} />
                                </button>
                            )}
                        </div>
                        <p style={{ color: '#4b5563', lineHeight: '1.7', fontSize: '0.95rem', margin: 0 }}>
                            {txt(result.summary, result.summary_translated) || t('results.summary_not_available')}
                        </p>
                    </div>

                    {result.health_score !== undefined && (
                        <HealthScore score={result.health_score} status={result.overall_status} />
                    )}
                </div>

                {/* Test Results Table */}
                <div className="card card-p" style={{ backgroundColor: '#fafafa', border: '1px solid #e5e7eb' }}>
                    <div className="flex-between mb-3" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>
                        <h2 className="section-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={18} /> {t('results.test_results')}
                        </h2>
                        <Badge type="success">{t('results.extraction_success')}</Badge>
                    </div>

                    <div style={{ width: '100%', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                    <th style={{ padding: '12px 8px', color: '#4b5563', fontWeight: 600 }}>{t('results.test_name')}</th>
                                    <th style={{ padding: '12px 8px', color: '#4b5563', fontWeight: 600 }}>{t('results.value')}</th>
                                    <th style={{ padding: '12px 8px', color: '#4b5563', fontWeight: 600 }}>{t('results.unit')}</th>
                                    <th style={{ padding: '12px 8px', color: '#4b5563', fontWeight: 600 }}>{t('results.status')}</th>
                                    <th style={{ padding: '12px 8px', color: '#4b5563', fontWeight: 600 }}>{t('results.remarks')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const arr = result.tests || result.ai_analysis;

                                    if (!arr || !Array.isArray(arr) || arr.length === 0) {
                                        return (
                                            <tr>
                                                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                                    {t('results.no_metrics_found')}
                                                </td>
                                            </tr>
                                        );
                                    }

                                    return arr.map((test, idx) => {
                                        const statusLow = test.status?.toLowerCase();
                                        const isAbnormal = statusLow === 'high' || statusLow === 'low';
                                        const remark     = txt(test.remark,      test.remark_translated);
                                        const reason     = txt(test.reason,      test.reason_translated);
                                        const suggestion = txt(test.suggestion,  test.suggestion_translated);
                                        return (
                                            <tr key={idx} style={{
                                                borderBottom: '1px solid #e5e7eb',
                                                backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb'
                                            }}>
                                                <td style={{ padding: '12px 8px', fontWeight: 500 }}>
                                                    {txt(test.test || test.name, test.test_translated)}
                                                </td>
                                                <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{test.value}</td>
                                                <td style={{ padding: '12px 8px', color: '#6b7280' }}>{test.unit}</td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    <Badge type={
                                                        statusLow === 'high' ? 'danger' :
                                                        statusLow === 'low'  ? 'warning' :
                                                        statusLow === 'normal' ? 'success' : 'neutral'
                                                    }>
                                                        {test.status || '-'}
                                                    </Badge>
                                                </td>
                                                <td style={{ padding: '12px 8px', fontSize: '0.88rem', lineHeight: '1.6', maxWidth: '320px' }}>
                                                    {/* Remark: concise 1-sentence summary */}
                                                    {remark && (
                                                        <p style={{ margin: '0 0 4px', color: isAbnormal ? '#dc2626' : '#374151', fontWeight: 500 }}>
                                                            {remark}
                                                        </p>
                                                    )}
                                                    {/* Reason: medical explanation (shown for abnormal) */}
                                                    {reason && reason !== remark && (
                                                        <p style={{ margin: '0 0 4px', color: '#6b7280', fontSize: '0.82rem' }}>
                                                            <strong>{displayLang === 'hi' ? 'क्यों:' : displayLang === 'mr' ? 'का:' : 'Why:'}</strong> {reason}
                                                        </p>
                                                    )}
                                                    {/* Suggestion: actionable advice */}
                                                    {suggestion && suggestion !== remark && (
                                                        <p style={{ margin: 0, color: '#0369a1', fontSize: '0.82rem' }}>
                                                            <strong>{displayLang === 'hi' ? 'सलाह:' : displayLang === 'mr' ? 'सल्ला:' : 'Advice:'}</strong> {suggestion}
                                                        </p>
                                                    )}
                                                    {!remark && !reason && '-'}
                                                </td>
                                            </tr>
                                        );
                                    });
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
