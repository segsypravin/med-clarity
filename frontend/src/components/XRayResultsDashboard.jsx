import { AlertCircle, History, CheckCircle2, AlertTriangle, Stethoscope, FileText, ChevronRight, TrendingUp, TrendingDown, Activity, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import config from '../config';
import { HealthScore } from './ui/index.jsx';
import { getRecommendedDoctor } from '../utils/specialtyMapper';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function XRayResultsDashboard({ record }) {
    const navigate = useNavigate();
    const [trendData, setTrendData] = useState(null);

    const result = record?.result;
    const tests = result?.tests || [];
    const predictionTest = tests.find(t => t.test === 'AI Image Prediction') || {};
    
    const prediction = predictionTest.value || 'Unknown';
    // score correlates to confidence
    const confidence = (record.score || 0) / 100;

    const extras = getRecommendedDoctor(prediction, confidence);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
                const historyRes = await fetch(`${config.API_BASE}/api/history`, {
                    headers: { ...(token && { Authorization: `Bearer ${token}` }) }
                });
                const historyData = await historyRes.json();
                if (historyData.success && historyData.records) {
                    const xrReports = historyData.records.filter(r => r.type === 'X-Ray').sort((a,b) => new Date(b.date) - new Date(a.date));
                    // Find the oldest next X-Ray (before this record)
                    const thisIndex = xrReports.findIndex(r => r.id === record.id);
                    const prevXR = xrReports[thisIndex + 1];

                    if (prevXR) {
                        const prevPred = prevXR.result?.tests?.[0]?.value?.toLowerCase() || '';
                        const currPred = prediction?.toLowerCase() || '';
                        
                        const currRisk = extras.riskLevel;
                        const prevRisk = getRecommendedDoctor(prevPred, (prevXR.score || 0) / 100).riskLevel;

                        let trendLabel = 'Stable';
                        let trendIcon = 'stable';

                        if (prevRisk !== 'Low' && currRisk === 'Low') {
                            trendLabel = 'Improved';
                            trendIcon = 'improved';
                        } else if (prevRisk === 'Low' && currRisk !== 'Low') {
                            trendLabel = 'Worsened';
                            trendIcon = 'worsened';
                        } else if (prevRisk === currRisk && currRisk !== 'Low') {
                            const confDiff = confidence - (prevXR.score/100);
                            if (confDiff > 0.08) {
                                trendLabel = 'Worsened';
                                trendIcon = 'worsened';
                            } else if (confDiff < -0.08) {
                                trendLabel = 'Improved';
                                trendIcon = 'improved';
                            }
                        }
                        
                        setTrendData({ label: trendLabel, icon: trendIcon, prevCondition: prevPred, currCondition: currPred, prevDate: prevXR.date, prevConfidence: prevXR.score });
                    }
                }
            } catch (err) {
                console.error("Trend check failed", err);
            }
        };
        fetchHistory();
    }, [record, prediction, confidence, extras.riskLevel]);

    const colors = {
        success: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', text: '#10b981', icon: CheckCircle2 },
        warning: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b', icon: AlertTriangle },
        error: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#ef4444', icon: AlertCircle },
    };

    const StatusIcon = colors[extras.riskClass].icon;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                
                {/* Image Placeholder Card */}
                <div className="card" style={{ flex: '1 1 300px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', minHeight: '300px' }}>
                    <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <FileText size={48} color="var(--primary)" />
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', textAlign: 'center' }}>X-Ray Analysis</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', maxWidth: '80%' }}>
                        Original scan images are not saved to the cloud for local privacy compliance. The AI findings are documented below.
                    </p>
                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center' }}>
                        <div style={{ padding: '0.5rem 1rem', background: 'var(--background)', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={14} /> {record.date}
                        </div>
                    </div>
                </div>

                {/* Primary Prediction Card */}
                <div className="card" style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', border: `1px solid ${colors[extras.riskClass].border}`, borderRadius: '24px' }}>
                    <div style={{ background: colors[extras.riskClass].bg, padding: '2rem', borderBottom: `1px solid ${colors[extras.riskClass].border}`, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ background: colors[extras.riskClass].text, borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: `0 0 20px ${colors[extras.riskClass].text}` }}>
                            <StatusIcon size={32} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                AI Image Prediction
                            </p>
                            <h2 style={{ fontSize: '2.2rem', margin: 0, color: 'var(--text)', fontWeight: 800, textTransform: 'capitalize' }}>
                                {prediction}
                            </h2>
                        </div>
                    </div>
                    <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: '0 0 0.5rem 0' }}>AI Confidence Level</p>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)' }}>
                                    {(confidence * 100).toFixed(1)}
                                </span>
                                <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>%</span>
                            </div>
                        </div>
                        <div style={{ width: 120, height: 120, transform: 'scale(1.2)' }}>
                            <HealthScore score={Math.round(confidence*100)} />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {/* Doctor Recommendation */}
                {extras.doctor && extras.riskLevel !== 'Low' && (
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="card" 
                        onClick={() => navigate(`/doctors?filter=${extras.doctor}`)}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: 'var(--primary-light)', border: '1px solid var(--border)', borderRadius: '16px' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Stethoscope size={24} />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: 'var(--text)' }}>{extras.doctor}</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Recommended Specialist</p>
                            </div>
                        </div>
                        <ChevronRight size={20} color="var(--primary)" />
                    </motion.div>
                )}

                {/* Trend Analysis */}
                <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <History size={20} color="var(--text-muted)" />
                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text)' }}>Historical Trend</h4>
                    </div>
                    {trendData ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: trendData.icon === 'worsened' ? 'rgba(239,68,68,0.05)' : trendData.icon === 'improved' ? 'rgba(16,185,129,0.05)' : 'rgba(107,114,128,0.05)', padding: '1rem', borderRadius: '12px', border: `1px solid ${trendData.icon === 'worsened' ? 'rgba(239,68,68,0.2)' : trendData.icon === 'improved' ? 'rgba(16,185,129,0.2)' : 'rgba(107,114,128,0.2)'}` }}>
                            {trendData.icon === 'worsened' ? <TrendingDown size={28} color="#ef4444" /> : trendData.icon === 'improved' ? <TrendingUp size={28} color="#10b981" /> : <Activity size={28} color="#6b7280" />}
                            <div>
                                <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', color: trendData.icon === 'worsened' ? '#ef4444' : trendData.icon === 'improved' ? '#10b981' : '#6b7280' }}>
                                    {trendData.label} Progression
                                </h5>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    Compared to <strong>{trendData.prevDate}</strong> {trendData.currCondition !== trendData.prevCondition && `(${trendData.prevCondition} -> ${trendData.currCondition})`}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            No older records found to establish a trend line.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
