import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSearch, CheckCircle2, AlertCircle, Loader2, Activity, Stethoscope, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { AiProcessingStepper } from './ui/AiProcessingStepper';
import { auth } from '../firebase';

export default function ScanUpload() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [currentCard, setCurrentCard] = useState(0);

    // Cleanup object URL
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setError(null);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError(t("scan.error_select_file"));
            return;
        }

        setLoading(true);
        setError(null);
        
        const formData = new FormData();
        formData.append("scan", file);

        try {
            const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
            const response = await fetch("http://localhost:5000/api/scan", {
                method: "POST",
                body: formData,
                headers: { ...(token && { Authorization: `Bearer ${token}` }) }
            });

            if (!response.ok) {
                throw new Error(t("scan.error_failed"));
            }

            const data = await response.json();
            setResult(data);
            
            // Save the X-Ray scan to the user's history
            try {
                const score = data.confidence ? Math.round(data.confidence * 100) : 0;
                const statusStr = data.prediction?.toLowerCase() === 'normal' ? 'normal' : 'high_risk';
                
                // Format the payload so it renders correctly if user clicks "View" from history
                const resultPayload = {
                    summary: `X-Ray Analysis indicates a prediction of ${data.prediction} with ${(data.confidence * 100).toFixed(1)}% confidence.`,
                    overall_status: statusStr === 'normal' ? 'Normal' : 'High Risk',
                    health_score: score,
                    tests: [{
                        test: 'AI Image Prediction',
                        value: data.prediction,
                        unit: 'N/A',
                        status: statusStr === 'normal' ? 'Normal' : 'High Risk',
                        remark: `Confidence level: ${(data.confidence * 100).toFixed(1)}%`
                    }]
                };

                await fetch('http://localhost:5000/api/history', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
                    body: JSON.stringify({
                        name: file.name,
                        filename: file.name,
                        date: new Date().toLocaleDateString(),
                        type: 'X-Ray',
                        status: statusStr,
                        score: score,
                        size: (file.size / 1024).toFixed(1) + ' KB',
                        result: resultPayload
                    })
                });
            } catch (historyErr) {
                console.error("Failed to save scan to history:", historyErr);
            }
        } catch (err) {
            setError(err.message || t("scan.error_unexpected"));
        } finally {
            setLoading(false);
        }
    };

    // Helper logic to map risk and doctor specifically without fake insights
    const getResultExtras = (prediction, confidence) => {
        let riskLevel = "Low";
        let riskClass = "badge-success";
        let doctor = "General Physician";

        const predLower = prediction?.toLowerCase() || "";
        
        // Dictionary-based specialty routing
        const pulmonologist = ["pneumonia", "covid", "coronavirus", "effusion", "atelectasis", "infiltration", "emphysema", "pneumothorax", "consolidation", "edema", "fibrosis", "pleural", "tb", "tuberculosis", "lung", "chest", "asthma"];
        const oncologist = ["tumor", "cancer", "nodule", "mass", "malignant", "carcinoma", "melanoma", "cyst", "neoplasm"];
        const cardiologist = ["cardiomegaly", "heart", "cardio", "vascular", "aorta", "arrhythmia", "ischemia", "valve"];
        const orthopedist = ["fracture", "bone", "joint", "osteo", "arthritis", "spine", "disk", "hernia", "scoliosis", "skeletal"];
        const neurologist = ["brain", "stroke", "hemorrhage", "aneurysm", "neuro", "nerve", "cognitive"];
        const normal = ["normal", "healthy", "none", "clear", "unremarkable"];

        if (oncologist.some(w => predLower.includes(w))) {
            riskLevel = "High";
            riskClass = "badge-error";
            doctor = "Oncologist";
        } else if (cardiologist.some(w => predLower.includes(w))) {
            riskLevel = "High";
            riskClass = "badge-error";
            doctor = "Cardiologist";
        } else if (neurologist.some(w => predLower.includes(w))) {
            riskLevel = "High";
            riskClass = "badge-error";
            doctor = "Neurologist";
        } else if (pulmonologist.some(w => predLower.includes(w))) {
            riskLevel = "High";
            riskClass = "badge-error";
            doctor = "Pulmonologist";
        } else if (orthopedist.some(w => predLower.includes(w))) {
            riskLevel = confidence > 0.6 ? "High" : "Medium";
            riskClass = confidence > 0.6 ? "badge-error" : "badge-warning";
            doctor = "Orthopedist";
        } else if (normal.some(w => predLower.includes(w))) {
            riskLevel = "Low";
            riskClass = "badge-success";
            doctor = "General Physician";
        } else {
            // Fallback for unknown conditions
            if (confidence >= 0.7) {
                 riskLevel = "High";
                 riskClass = "badge-error";
            } else if (confidence >= 0.4) {
                 riskLevel = "Medium";
                 riskClass = "badge-warning";
            } else {
                 riskLevel = "Low";
                 riskClass = "badge-success";
            }
            // Default to GP for completely unrecognizable but flagged inputs
            doctor = "General Physician";
        }

        return { riskLevel, riskClass, doctor };
    };

    const resultExtras = result ? getResultExtras(result.prediction, result.confidence) : null;

    return (
        <>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>{t("scan.title")}</h1>
                    <p>{t("scan.subtitle")}</p>
                </div>
            </div>

            <div className="page-body animate-fade-up" style={{ paddingBottom: '2rem' }}>
                <div className="grid-2" style={{ gap: '2rem' }}>
                {/* ── LEFT COLUMN: INPUT SCAN ── */}
                <div className="card card-p-lg" style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
                    <h3 className="section-title mb-3" style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>
                        {t("scan.upload_your_scan")}
                    </h3>

                    <div 
                        className="upload-area" 
                        style={{ 
                            flexGrow: 1, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            padding: previewUrl ? '1rem' : '3.5rem 2rem',
                            border: previewUrl ? '2px solid var(--border)' : '1px dashed rgba(192, 21, 42, 0.3)',
                            backgroundColor: previewUrl ? 'var(--surface)' : 'var(--primary-light)',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            transition: 'all 0.2s',
                            cursor: previewUrl ? 'default' : 'pointer',
                            textAlign: 'center'
                        }}
                        onClick={() => !previewUrl && document.getElementById('scan-upload').click()}
                    >
                        {previewUrl ? (
                            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'default' }}>
                                <img 
                                    src={previewUrl} 
                                    alt="X-ray Preview" 
                                    style={{ 
                                        maxWidth: '100%', 
                                        maxHeight: '260px', 
                                        objectFit: 'contain', 
                                        borderRadius: 'var(--radius-sm)',
                                        marginBottom: '1rem',
                                        boxShadow: 'var(--shadow-sm)',
                                        border: '1px solid var(--border)'
                                    }} 
                                />
                                <label htmlFor="scan-upload" className="btn btn-outline btn-sm" style={{ cursor: 'pointer', padding: '0.5rem 1rem' }} onClick={(e) => e.stopPropagation()}>
                                    {t("scan.change_image")}
                                </label>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                                <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
                                    <Upload size={44} />
                                </div>
                                <p style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.4rem', color: 'var(--text)' }}>
                                    {t("scan.drag_drop")}
                                </p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                                    {t("scan.supported_files")}
                                </p>
                                <button className="btn btn-outline" style={{ pointerEvents: 'none' }}>
                                    {t("scan.browse_files")}
                                </button>
                            </div>
                        )}
                        <input
                            type="file"
                            id="scan-upload"
                            hidden
                            onChange={handleFileChange}
                            accept="image/*,.pdf"
                        />
                    </div>

                    {loading && (
                        <div className="processing-state animate-fade-up" style={{ marginTop: '1rem' }}>
                            <AiProcessingStepper />
                        </div>
                    )}

                    <button 
                        className="btn btn-primary" 
                        style={{ width: '100%', padding: '0.9rem', marginTop: '1.25rem', fontSize: '1.05rem', fontWeight: 600, border: 'none', borderRadius: '8px' }}
                        onClick={handleUpload}
                        disabled={loading || !file}
                    >
                        {loading ? (
                            <><Loader2 className="animate-spin mr-2" size={20} /> {t("scan.analyzing_image")}</>
                        ) : file ? (
                            <><Activity size={20} className="mr-2" /> {t("scan.analyze_scan")}</>
                        ) : (
                            <><Activity size={20} className="mr-2" /> {t("scan.select_scan")}</>
                        )}
                    </button>

                    {error && (
                        <div style={{ 
                            marginTop: '1.25rem', padding: '1rem', borderRadius: 'var(--radius-sm)',
                            background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B',
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            animation: 'fadeUp 0.3s ease-out'
                        }}>
                            <AlertCircle size={20} style={{ flexShrink: 0 }} />
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{error}</span>
                        </div>
                    )}
                </div>

                {/* ── RIGHT COLUMN: RESULT (Now Carousel) ── */}
                <div className="card card-p-lg" style={{ 
                    background: result ? 'var(--surface)' : 'var(--background)', 
                    display: 'flex', flexDirection: 'column', 
                    justifyContent: result ? 'flex-start' : 'center', 
                    alignItems: result ? 'stretch' : 'center', 
                    border: result ? '1px solid var(--border)' : '1px dashed var(--border)',
                    boxShadow: result ? 'var(--shadow)' : 'none',
                    minHeight: '440px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {!result && !loading ? (
                         <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            <FileSearch size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text)' }}>{t("scan.awaiting_analysis")}</h3>
                            <p style={{ fontSize: '0.95rem', maxWidth: '280px', margin: '0 auto' }}>{t("scan.awaiting_desc")}</p>
                         </div>
                    ) : loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div className="pulse-audio" style={{ 
                                width: 80, height: 80, borderRadius: '50%', 
                                background: 'var(--primary-light)', display: 'flex', 
                                alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
                            }}>
                                <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '0.5rem' }}>{t("scan.processing_image")}</h3>
                            <p style={{ color: 'var(--text-muted)' }}>{t("scan.working_on_it")}</p>
                        </div>
                    ) : result ? (
                        <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            {/* Header & Navigation */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ 
                                        width: 10, height: 10, borderRadius: '50%', 
                                        backgroundColor: resultExtras.riskLevel === 'Low' ? '#10b981' : resultExtras.riskLevel === 'High' ? '#ef4444' : '#f59e0b',
                                        boxShadow: resultExtras.riskLevel === 'Low' ? '0 0 10px #10b981' : resultExtras.riskLevel === 'High' ? '0 0 10px #ef4444' : '0 0 10px #f59e0b'
                                    }} />
                                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {t("scan.analysis_complete")}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button 
                                        onClick={() => setCurrentCard(c => Math.max(0, c - 1))}
                                        disabled={currentCard === 0}
                                        style={{ background: 'none', border: 'none', cursor: currentCard === 0 ? 'default' : 'pointer', opacity: currentCard === 0 ? 0.3 : 1, padding: 4 }}
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button 
                                        onClick={() => setCurrentCard(c => Math.min(2, c + 1))}
                                        disabled={currentCard === 2}
                                        style={{ background: 'none', border: 'none', cursor: currentCard === 2 ? 'default' : 'pointer', opacity: currentCard === 2 ? 0.3 : 1, padding: 4 }}
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Carousel Content */}
                            <div style={{ flex: 1, position: 'relative' }}>
                                <AnimatePresence mode="wait">
                                    {currentCard === 0 && (
                                        <motion.div 
                                            key="card-detection"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 1.05 }}
                                            transition={{ duration: 0.4 }}
                                            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                                        >
                                            <div style={{ 
                                                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                                                padding: '2rem', borderRadius: '24px', 
                                                background: resultExtras.riskLevel === 'Low' 
                                                    ? 'linear-gradient(135deg, #064e3b 0%, #031a12 100%)' 
                                                    : resultExtras.riskLevel === 'High' 
                                                        ? 'linear-gradient(135deg, #450a0a 0%, #1a0505 100%)'
                                                        : 'linear-gradient(135deg, #451a03 0%, #1a0802 100%)',
                                                border: `1.5px solid ${resultExtras.riskLevel === 'Low' ? '#10b98140' : resultExtras.riskLevel === 'High' ? '#ef444440' : '#f59e0b40'}`,
                                                position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                                            }}>
                                                {/* Holographic sweep */}
                                                <motion.div 
                                                    animate={{ top: ['-20%', '120%'] }}
                                                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                                    style={{ 
                                                        position: 'absolute', left: 0, right: 0, height: '40px', 
                                                        background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.05), transparent)',
                                                        zIndex: 0, pointerEvents: 'none'
                                                    }}
                                                />

                                                {/* Confidence Gauge (SVG) */}
                                                <div style={{ position: 'relative', width: 140, height: 140, marginBottom: '1.5rem', zIndex: 1 }}>
                                                    <svg width="140" height="140" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                                                        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                                        <motion.circle 
                                                            cx="50" cy="50" r="44" fill="none" 
                                                            stroke={resultExtras.riskLevel === 'Low' ? '#10b981' : resultExtras.riskLevel === 'High' ? '#ef4444' : '#f59e0b'} 
                                                            strokeWidth="8"
                                                            strokeDasharray={2 * Math.PI * 44}
                                                            initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
                                                            animate={{ strokeDashoffset: (2 * Math.PI * 44) * (1 - result.confidence) }}
                                                            transition={{ duration: 1.8, ease: 'easeOut', delay: 0.2 }}
                                                            strokeLinecap="round"
                                                            style={{ filter: `drop-shadow(0 0 8px ${resultExtras.riskLevel === 'Low' ? '#10b981' : resultExtras.riskLevel === 'High' ? '#ef4444' : '#f59e0b'})` }}
                                                        />
                                                    </svg>
                                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                                        <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>
                                                            {(result.confidence * 100).toFixed(0)}%
                                                        </span>
                                                        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>AI CONFID</span>
                                                    </div>
                                                </div>

                                                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, textAlign: 'center', color: 'white', margin: '0 0 0.5rem', letterSpacing: '-0.02em', zIndex: 1 }}>
                                                    {result.prediction ? result.prediction.charAt(0).toUpperCase() + result.prediction.slice(1) : t("scan.unknown")}
                                                </h2>
                                                
                                                <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: resultExtras.riskLevel === 'Low' ? '#10b981' : '#ef4444' }}></div>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        {t(`common.${resultExtras.riskLevel === "Low" ? "normal" : resultExtras.riskLevel === "High" ? "high_risk" : "moderate"}`)} {resultExtras.riskLevel === "Low" ? "Result" : resultExtras.riskLevel === "High" ? "Detected" : "Risk Detected"}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {currentCard === 1 && (
                                        <motion.div 
                                            key="card-insights"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 1.05 }}
                                            transition={{ duration: 0.4 }}
                                            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                                        >
                                            <div style={{ 
                                                flex: 1, padding: '2.25rem', borderRadius: '24px', 
                                                background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                                                position: 'relative', backdropFilter: 'blur(10px)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                                    <div style={{ width: 42, height: 42, borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(192,21,42,0.2)' }}>
                                                        <Activity size={22} />
                                                    </div>
                                                    <div>
                                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>Clinical Summary</h3>
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deep Learning Engine v4.0</span>
                                                    </div>
                                                </div>
                                                <p style={{ fontSize: '1rem', lineHeight: '1.8', color: 'var(--text)', marginBottom: '1.75rem', fontWeight: 500 }}>
                                                    {resultExtras.riskLevel === "Low" 
                                                        ? "The AI analysis model has flagged your image as 'Normal'. No significant radiographic findings were detected in the primary survey area."
                                                        : "The AI analysis model has identified suspicious patterns that correlate with typical clinical markers for this condition. Further professional review is strongly recommended."}
                                                </p>
                                                <div style={{ 
                                                    padding: '1.25rem', borderRadius: '16px', background: 'var(--primary-light)', 
                                                    border: '1px solid var(--border-red)', position: 'relative'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                                        <CheckCircle2 size={16} color="var(--primary)" />
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>Expert Review Recommendation</span>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.5 }}>
                                                        A {resultExtras.doctor} should correlate these findings with your clinical history.
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {currentCard === 2 && (
                                        <motion.div 
                                            key="card-action"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 1.05 }}
                                            transition={{ duration: 0.4 }}
                                            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                                        >
                                            <div 
                                                onClick={() => navigate(`/doctors?filter=${encodeURIComponent(resultExtras.doctor)}`)}
                                                style={{ 
                                                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                    padding: '2.5rem', borderRadius: '24px', 
                                                    background: 'linear-gradient(135deg, white 0%, #f1f5f9 100%)', 
                                                    border: '2px solid var(--primary)', cursor: 'pointer',
                                                    textAlign: 'center', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                                                    boxShadow: '0 25px 50px -12px rgba(192,21,42,0.25)'
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = 'var(--secondary)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                                            >
                                                <div style={{ 
                                                    width: 80, height: 80, borderRadius: '24px', background: 'var(--primary)', 
                                                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.75rem',
                                                    boxShadow: '0 12px 24px rgba(192,21,42,0.3)', transform: 'rotate(-5deg)'
                                                }}>
                                                    <Stethoscope size={40} />
                                                </div>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.12em' }}>
                                                    Recommended Specialist
                                                </p>
                                                <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
                                                    {resultExtras.doctor && t(`doctors.${resultExtras.doctor.toLowerCase().replace(' ', '_')}`) !== `doctors.${resultExtras.doctor.toLowerCase().replace(' ', '_')}` ? t(`doctors.${resultExtras.doctor.toLowerCase().replace(' ', '_')}`) : resultExtras.doctor}
                                                </h3>
                                                <div className="btn btn-primary" style={{ padding: '0.8rem 2.5rem', borderRadius: '50px', fontSize: '1rem', fontWeight: 700, gap: '0.75rem', boxShadow: '0 8px 20px var(--primary-glow)' }}>
                                                    Book Consultation <ChevronRight size={20} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Carousel Indicators (Dots) */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginTop: '1.25rem' }}>
                                {[0, 1, 2].map((idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setCurrentCard(idx)}
                                        style={{ 
                                            padding: 0, border: 'none', width: idx === currentCard ? 24 : 10, height: 10, 
                                            borderRadius: 5, background: idx === currentCard ? 'var(--primary)' : 'var(--border)',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer'
                                        }}
                                        title={`Step ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>

            </div>
            </div>
        </>
    );
}
