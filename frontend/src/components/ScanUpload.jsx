import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileSearch, CheckCircle2, AlertCircle, Loader2, Activity, Stethoscope, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { auth } from '../firebase';

export default function ScanUpload() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

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

                {/* ── RIGHT COLUMN: RESULT ── */}
                <div className="card card-p-lg" style={{ 
                    background: result ? 'var(--surface)' : 'var(--background)', 
                    display: 'flex', flexDirection: 'column', 
                    justifyContent: result ? 'flex-start' : 'center', 
                    alignItems: result ? 'stretch' : 'center', 
                    border: result ? '1px solid var(--border)' : '1px dashed var(--border)',
                    boxShadow: result ? 'var(--shadow)' : 'none',
                    minHeight: '400px'
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
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ background: 'var(--success-bg)', padding: '0.5rem', borderRadius: '50%' }}>
                                        <CheckCircle2 color="var(--success)" size={24} />
                                    </div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text)', margin: 0 }}>{t("scan.analysis_complete")}</h3>
                                </div>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t("scan.ai_computed")}</span>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div className="card-p" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: 'var(--radius-sm)' }}>
                                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        <Activity size={16} color="var(--primary)" /> {t("scan.prediction")}
                                    </p>
                                    <p style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--text)' }}>
                                        {result.prediction ? result.prediction.charAt(0).toUpperCase() + result.prediction.slice(1) : t("scan.unknown")}
                                    </p>
                                </div>
                                <div className="card-p" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: 'var(--radius-sm)' }}>
                                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.6rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        <FileSearch size={16} color="var(--primary)" /> {t("scan.risk")}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <span className={`badge ${resultExtras.riskClass}`} style={{ fontSize: '0.85rem', padding: '0.3rem 0.6rem' }}>
                                            {t(`common.${resultExtras.riskLevel === "Low" ? "normal" : resultExtras.riskLevel === "High" ? "high_risk" : "moderate"}`)}
                                        </span>
                                        <span style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--text)' }}>
                                            {result.confidence ? (result.confidence * 100).toFixed(1) : 0}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ flexGrow: 1 }}></div>

                            <div 
                                onClick={() => navigate(`/doctors?filter=${encodeURIComponent(resultExtras.doctor)}`)}
                                style={{ 
                                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', 
                                    backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius)', 
                                    border: '1px solid var(--border-red)', cursor: 'pointer',
                                    transition: 'all 0.2s ease', WebkitTapHighlightColor: 'transparent'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Stethoscope size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t("scan.recommended_specialist")}</p>
                                    <p style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)' }}>
                                        {resultExtras.doctor && t(`doctors.${resultExtras.doctor.toLowerCase().replace(' ', '_')}`) !== `doctors.${resultExtras.doctor.toLowerCase().replace(' ', '_')}` ? t(`doctors.${resultExtras.doctor.toLowerCase().replace(' ', '_')}`) : resultExtras.doctor}
                                    </p>
                                </div>
                                <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                    {t("scan.find")} <span style={{ fontSize: '1.2rem' }}>&rarr;</span>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
            </div>
        </>
    );
}
