import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, FileText, AlertTriangle, Loader2, Info, TrendingUp, TrendingDown, CheckCircle2, Activity, ChevronLeft, ChevronRight, Lightbulb, Stethoscope, HeartPulse, Zap, MessageCircle, LayoutGrid, Maximize, Volume2, VolumeX, X, History } from 'lucide-react';
import { HealthScore } from '../components/ui/index.jsx';
import ChatDrawer from '../components/ChatDrawer.jsx';
import XRayResultsDashboard from '../components/XRayResultsDashboard.jsx';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { auth } from '../firebase';
import config from '../config';
import {
    PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

// ── Status configs with gradient themes ──────────────────────────────────────
const STATUS_THEMES = {
    high: {
        color: '#ef4444', glow: 'rgba(239,68,68,0.3)',
        gradient: 'linear-gradient(135deg, #1a0506 0%, #2d0a0d 30%, #450f14 60%, #1a0506 100%)',
        barBg: 'rgba(239,68,68,0.15)', barFill: '#ef4444',
        icon: TrendingUp, label: 'HIGH', emoji: '🔴',
        accent: '#fca5a5', cardBorder: 'rgba(239,68,68,0.35)',
    },
    low: {
        color: '#f59e0b', glow: 'rgba(245,158,11,0.3)',
        gradient: 'linear-gradient(135deg, #1a1305 0%, #2d2108 30%, #45320c 60%, #1a1305 100%)',
        barBg: 'rgba(245,158,11,0.15)', barFill: '#f59e0b',
        icon: TrendingDown, label: 'LOW', emoji: '🟡',
        accent: '#fcd34d', cardBorder: 'rgba(245,158,11,0.35)',
    },
    normal: {
        color: '#10b981', glow: 'rgba(16,185,129,0.3)',
        gradient: 'linear-gradient(135deg, #031a12 0%, #05291c 30%, #083d2a 60%, #031a12 100%)',
        barBg: 'rgba(16,185,129,0.15)', barFill: '#10b981',
        icon: CheckCircle2, label: 'NORMAL', emoji: '🟢',
        accent: '#6ee7b7', cardBorder: 'rgba(16,185,129,0.35)',
    },
    neutral: {
        color: '#6b7280', glow: 'rgba(107,114,128,0.2)',
        gradient: 'linear-gradient(135deg, #111318 0%, #1a1d24 30%, #252830 60%, #111318 100%)',
        barBg: 'rgba(107,114,128,0.15)', barFill: '#6b7280',
        icon: Activity, label: '—', emoji: '⚪',
        accent: '#9ca3af', cardBorder: 'rgba(107,114,128,0.3)',
    },
};

function getTheme(status) {
    return STATUS_THEMES[status?.toLowerCase()] || STATUS_THEMES.neutral;
}

// ── Range Bar: visual bar with normal zone + value marker ────────────────────
function RangeBar({ value, normalRange, status, theme }) {
    // Strip commas from value, then remove non-numerics (but keep dot and minus)
    const numValStr = String(value).replace(/,/g, '').replace(/[^0-9.-]/g, '');
    const numVal = parseFloat(numValStr);
    let lo = 0, hi = 100, rangeMin = 0, rangeMax = 200;

    if (normalRange && normalRange !== '-') {
        const cleanNormalRange = String(normalRange).replace(/,/g, '');
        const nums = cleanNormalRange.match(/[\d.]+/g);
        if (nums && nums.length >= 2) {
            lo = parseFloat(nums[0]);
            hi = parseFloat(nums[1]);
            if (lo > hi) {
                const temp = lo;
                lo = hi;
                hi = temp;
            }
            rangeMin = Math.max(0, lo - (hi - lo) * 0.6);
            rangeMax = hi + (hi - lo) * 0.6;
        }
    }

    if (isNaN(numVal) || rangeMax === rangeMin) {
        const pos = status?.toLowerCase() === 'low' ? 18 : status?.toLowerCase() === 'high' ? 82 : 50;
        return <SimpleBar pos={pos} theme={theme} />;
    }

    const normalLeft = ((lo - rangeMin) / (rangeMax - rangeMin)) * 100;
    const normalWidth = ((hi - lo) / (rangeMax - rangeMin)) * 100;
    const valuePct = Math.min(100, Math.max(0, ((numVal - rangeMin) / (rangeMax - rangeMin)) * 100));

    return (
        <div style={{ position: 'relative', marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginBottom: 6, fontWeight: 500 }}>
                <span>{rangeMin.toFixed(0)}</span>
                <span>{rangeMax.toFixed(0)}</span>
            </div>
            <div style={{ position: 'relative', height: 12, background: 'rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'visible' }}>
                <div style={{
                    position: 'absolute', left: `${normalLeft}%`, width: `${normalWidth}%`, height: '100%',
                    background: 'rgba(16,185,129,0.25)', borderRadius: 6, border: '1px solid rgba(16,185,129,0.3)',
                }} />
                <motion.div
                    initial={{ left: '50%', scale: 0 }}
                    animate={{ left: `${valuePct}%`, scale: 1 }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                    style={{
                        position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
                        width: 20, height: 20, borderRadius: '50%',
                        background: theme.color, border: '3px solid white',
                        boxShadow: `0 0 12px ${theme.glow}, 0 2px 8px rgba(0,0,0,0.3)`,
                        zIndex: 2,
                    }}
                />
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'rgba(16,185,129,0.7)', marginTop: 6, fontWeight: 600 }}>
                Normal Range: {normalRange}
            </div>
        </div>
    );
}

function SimpleBar({ pos, theme }) {
    return (
        <div style={{ position: 'relative', height: 12, background: 'rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'visible', margin: '10px 0' }}>
            <div style={{ position: 'absolute', left: '25%', width: '50%', height: '100%', background: 'rgba(16,185,129,0.2)', borderRadius: 6 }} />
            <motion.div
                initial={{ left: '50%', scale: 0 }}
                animate={{ left: `${pos}%`, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                style={{
                    position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
                    width: 20, height: 20, borderRadius: '50%',
                    background: theme.color, border: '3px solid white',
                    boxShadow: `0 0 12px ${theme.glow}, 0 2px 8px rgba(0,0,0,0.3)`,
                    zIndex: 2,
                }}
            />
        </div>
    );
}

function MiniDonut({ status, size = 80 }) {
    const theme = getTheme(status);
    const fillPct = status?.toLowerCase() === 'normal' ? 90 : status?.toLowerCase() === 'high' ? 70 : 40;
    const data = [
        { name: 'fill', value: fillPct },
        { name: 'empty', value: 100 - fillPct },
    ];
    return (
        <div style={{ width: size, height: size, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={data} innerRadius="65%" outerRadius="100%" startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                        <Cell fill={theme.color} />
                        <Cell fill="rgba(255,255,255,0.08)" />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 800, color: theme.color,
            }}>
                {theme.emoji}
            </div>
        </div>
    );
}

function FlashCard({ test, index, total, txt, displayLang }) {
    const theme = getTheme(test.status);
    const StatusIcon = theme.icon;
    const remark     = txt(test.remark,     test.remark_translated);
    const reason     = txt(test.reason,     test.reason_translated);
    const suggestion = txt(test.suggestion, test.suggestion_translated);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.35 }}
            style={{
                background: theme.gradient,
                border: `1.5px solid ${theme.cardBorder}`,
                borderRadius: 24,
                padding: '1.25rem 1.75rem',
                minHeight: 340,
                position: 'relative',
                overflow: 'hidden',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div style={{
                position: 'absolute', top: -60, right: -60, width: 200, height: 200,
                borderRadius: '50%', background: theme.glow, filter: 'blur(80px)',
                pointerEvents: 'none', opacity: 0.4,
            }} />
            <div style={{
                position: 'absolute', bottom: -40, left: -40, width: 160, height: 160,
                borderRadius: '50%', background: theme.glow, filter: 'blur(60px)',
                pointerEvents: 'none', opacity: 0.25,
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
                <div>
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: `${theme.color}30`, border: `1px solid ${theme.color}60`,
                            padding: '6px 14px', borderRadius: 30, fontSize: '0.75rem', fontWeight: 700,
                            color: theme.accent, letterSpacing: '0.06em', textTransform: 'uppercase',
                        }}
                    >
                        <StatusIcon size={14} /> {theme.label}
                    </motion.div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: 8, fontWeight: 500 }}>
                        {index + 1} of {total} parameters
                    </div>
                </div>
                <MiniDonut status={test.status} />
            </div>

            <motion.h2
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{
                    fontSize: '1.35rem', fontWeight: 800, color: 'white', margin: '0 0 0.25rem',
                    letterSpacing: '-0.02em', position: 'relative', zIndex: 1,
                }}
            >
                {txt(test.test || test.name, test.test_translated)}
            </motion.h2>

            <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: '0.75rem', position: 'relative', zIndex: 1 }}
            >
                <span style={{ fontSize: '2.4rem', fontWeight: 900, color: theme.accent, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                    {test.value ?? '—'}
                </span>
                <span style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                    {test.unit}
                </span>
            </motion.div>

            {test.unit !== 'N/A' && test.value !== 'N/A' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{ position: 'relative', zIndex: 1, marginBottom: '1.25rem' }}
                >
                    <RangeBar value={test.value} normalRange={test.normal_range} status={test.status} theme={theme} />
                </motion.div>
            )}

            <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}
            >
                {remark && (
                    <div style={{
                        background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 16px',
                        border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                            <Stethoscope size={14} color={theme.accent} />
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: theme.accent, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {displayLang === 'hi' ? 'रिपोर्ट' : displayLang === 'mr' ? 'अहवाल' : 'Finding'}
                            </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, fontWeight: 500 }}>
                            {remark}
                        </p>
                    </div>
                )}

                {reason && reason !== remark && (
                    <div style={{
                        background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '14px 16px',
                        border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                            <Lightbulb size={14} color="#fbbf24" />
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {displayLang === 'hi' ? 'संभावित कारण' : displayLang === 'mr' ? 'संभाव्य कारणे' : 'Possible Reasons'}
                            </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontWeight: 400 }}>
                            {reason}
                        </p>
                    </div>
                )}

                {suggestion && suggestion !== remark && (
                    <div style={{
                        background: 'rgba(56,189,248,0.06)', borderRadius: 14, padding: '14px 16px',
                        border: '1px solid rgba(56,189,248,0.15)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                            <HeartPulse size={14} color="#38bdf8" />
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {displayLang === 'hi' ? 'सुधार के लिए सुझाव' : displayLang === 'mr' ? 'सुधारणेसाठी सूचना' : 'Suggestions for Improvement'}
                            </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontWeight: 400 }}>
                            {suggestion}
                        </p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

export default function Results() {
    const location = useLocation();
    const navigate = useNavigate();
    const { language: displayLang, t } = useLanguage();

    const [result, setResult] = useState(() => {
        const raw = location.state?.result;
        return raw?.result || raw || null;
    });
    
    const isXRay = location.state?.type === 'X-Ray';
    const historyRecord = location.state?.record;

    const [isTranslating, setIsTranslating] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isGalleryView, setIsGalleryView] = useState(false);
    const [currentCard, setCurrentCard] = useState(0);
    const [direction, setDirection] = useState(0); 
    const [sortBy, setSortBy] = useState('default');
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    // Trend Analysis State
    const [isFetchingTrend, setIsFetchingTrend] = useState(false);
    const [trendData, setTrendData] = useState(null);
    const [showTrendModal, setShowTrendModal] = useState(false);

    const lastTranslatedLang = useRef(displayLang);
    const resultRef = useRef(result);
    
    // Keep resultRef in sync with latest result
    useEffect(() => {
        resultRef.current = result;
    }, [result]);

    useEffect(() => {
        if (!resultRef.current) return;
        if (displayLang === lastTranslatedLang.current) return;
        
        const translate = async () => {
            setIsTranslating(true);
            try {
                const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
                const res = await fetch(`${config.API_BASE}/api/analyze/translate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
                    body: JSON.stringify({ data: resultRef.current, lang: displayLang })
                });
                if (!res.ok) throw new Error('Network error');
                const json = await res.json();
                // Backend wraps in { status: "success", result: {...} }
                const translated = json.result || json;
                if (translated && (translated.summary || translated.summary_translated || translated.tests)) {
                    setResult(translated);
                    lastTranslatedLang.current = displayLang;
                }
            } catch (err) {
                console.warn('[Translation] Failed:', err.message);
            } finally {
                setIsTranslating(false);
            }
        };
        translate();
    }, [displayLang]);

    const txt = (en, translated) => displayLang !== 'en' && translated ? translated : (en || '');

    const tests = result?.tests || result?.ai_analysis || [];
    const totalCards = tests.length;

    const goNext = useCallback(() => {
        if (currentCard < totalCards - 1) { setDirection(1); setCurrentCard(c => c + 1); }
    }, [currentCard, totalCards]);

    const goPrev = useCallback(() => {
        if (currentCard > 0) { setDirection(-1); setCurrentCard(c => c - 1); }
    }, [currentCard]);

    const handleVoiceSummary = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const text = txt(result.summary, result.summary_translated);
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Match language
        if (displayLang === 'hi') utterance.lang = 'hi-IN';
        else if (displayLang === 'mr') utterance.lang = 'mr-IN';
        else utterance.lang = 'en-US';

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        return () => window.speechSynthesis.cancel();
    }, []);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [goNext, goPrev]);

    const handleTrendAnalysis = async () => {
        setIsFetchingTrend(true);
        try {
            const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
            const res = await fetch(`${config.API_BASE}/api/history`, {
            headers: { ...(token && { Authorization: `Bearer ${token}` }) }
            });
            const data = await res.json();
            
            if (data.success && data.records) {
                // Determine current report type
                const currentType = (result?.report_type || historyRecord?.type || 'Blood Report').toLowerCase();
                
                // Helper to check if two report types are "similar enough"
                const areSimilar = (t1, t2) => {
                    const cleanT1 = (t1 || '').toLowerCase();
                    const cleanT2 = (t2 || '').toLowerCase();
                    if (cleanT1 === cleanT2) return true;
                    // Common keywords to group reports
                    const groups = ['blood', 'urine', 'thyroid', 'kidney', 'liver', 'lipid'];
                    for (const group of groups) {
                        if (cleanT1.includes(group) && cleanT2.includes(group)) return true;
                    }
                    return false;
                };

                // Filter history for SIMILAR types
                const similarReports = data.records.filter(r => {
                    return areSimilar(r.type, currentType);
                });

                let prevReport = null;
                
                if (similarReports.length > 0) {
                    // Skip current if it matches exactly (already saved)
                    if (JSON.stringify(similarReports[0].result?.tests) === JSON.stringify(result.tests)) {
                        prevReport = similarReports[1];
                    } else {
                        prevReport = similarReports[0];
                    }
                }

                if (prevReport && prevReport.result && prevReport.result.tests) {
                    const cleanName = (s) => (s || '').toLowerCase().replace(/\(.*\)/g, '').replace(/[^a-z0-9]/g, '').trim();
                    const isSameTest = (n1, n2) => {
                        const s1 = cleanName(n1);
                        const s2 = cleanName(n2);
                        if (!s1 || !s2) return false;
                        if (s1 === s2) return true;
                        
                        // Handle common synonyms and spelling variations
                        const synonyms = [
                            ['hb', 'hemoglobin'],
                            ['hb', 'haemoglobin'],
                            ['hgb', 'hemoglobin'],
                            ['hgb', 'haemoglobin'],
                            ['hemoglobin', 'haemoglobin'],
                            ['rbc', 'redbloodcell'],
                            ['rbccount', 'redbloodcellcount'],
                            ['rbccount', 'rbc'],
                            ['wbc', 'whitebloodcell'],
                            ['wbccount', 'whitebloodcellcount'],
                            ['wbccount', 'wbc'],
                            ['plt', 'platelet'],
                            ['pltcount', 'plateletcount'],
                            ['pltcount', 'platelet'],
                            ['hct', 'hematocrit'],
                            ['cbc', 'completebloodcount']
                        ];
                        if (synonyms.some(([a, b]) => (s1 === a && s2 === b) || (s1 === b && s2 === a))) return true;

                        // Check if one starts with the other or contains significant parts
                        if (s1.includes(s2) && s2.length > 2) return true;
                        if (s2.includes(s1) && s1.length > 2) return true;

                        return false;
                    };

                    const comparison = result.tests.map(currTest => {
                        const testName = currTest.test || currTest.name;
                        const prevMatch = prevReport.result.tests.find(t => isSameTest(t.test || t.name, testName));
                        
                        let trend = 'stable';
                        let impact = 'neutral';

                        if (prevMatch) {
                            const cVal = parseFloat(String(currTest.value).replace(/[^0-9.]/g, ''));
                            const pVal = parseFloat(String(prevMatch.value).replace(/[^0-9.]/g, ''));
                            
                            const cStat = currTest.status?.toLowerCase();
                            const pStat = prevMatch.status?.toLowerCase();

                            // 1. Determine Trend Direction
                            if (!isNaN(cVal) && !isNaN(pVal)) {
                                if (cVal > pVal) trend = 'up';
                                else if (cVal < pVal) trend = 'down';
                            }

                            // 2. Determine Health Impact (Medical Improvement Logic)
                            const isCurrentlyNormal = cStat === 'normal';
                            const wasPreviouslyNormal = pStat === 'normal';

                            if (isCurrentlyNormal) {
                                impact = 'improved'; // Reaching or staying in normal is always good
                            } else if (cStat === 'high' && trend === 'down') {
                                impact = 'improved'; // Getting closer to normal from top
                            } else if (cStat === 'low' && trend === 'up') {
                                impact = 'improved'; // Getting closer to normal from bottom
                            } else if (!isCurrentlyNormal && wasPreviouslyNormal) {
                                impact = 'worsened'; // Moved out of normal range
                            } else if (cStat === 'high' && trend === 'up') {
                                impact = 'worsened'; // Getting worse (higher)
                            } else if (cStat === 'low' && trend === 'down') {
                                impact = 'worsened'; // Getting worse (lower)
                            } else {
                                impact = 'stable';
                            }
                        }

                        return {
                            name: testName,
                            current: currTest.value,
                            previous: prevMatch ? prevMatch.value : '—',
                            unit: currTest.unit,
                            status: currTest.status?.toLowerCase(),
                            prevStatus: prevMatch ? prevMatch.status?.toLowerCase() : null,
                            trend,
                            impact
                        };
                    });

                    setTrendData({ 
                        date: prevReport.date, 
                        comparison,
                        prevScore: prevReport.score || prevReport.result?.health_score
                    });
                } else {
                    setTrendData({ error: displayLang === 'hi' ? 'तुलना करने के लिए कोई पिछली रिपोर्ट नहीं मिली।' : 'No previous reports found to compare with.' });
                }
            } else {
                setTrendData({ error: 'Failed to fetch history.' });
            }
        } catch (err) {
            console.error(err);
            setTrendData({ error: 'Cannot connect to server.' });
        } finally {
            setIsFetchingTrend(false);
            setShowTrendModal(true);
        }
    };

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

    if (isXRay) {
        return (
            <div style={{ paddingBottom: '6rem' }}>
                <div className="page-header" style={{ marginBottom: '2rem' }}>
                    <div className="page-header-left">
                        <button className="btn btn-ghost" style={{ padding: 8, marginRight: 8, border: '1px solid var(--border)', background: 'var(--surface)' }} onClick={() => navigate(-1)}>
                            <ChevronLeft size={18} />
                        </button>
                        <div>
                            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                X-Ray Analysis Results
                            </h1>
                            <p>AI-powered insights based on your medical scan.</p>
                        </div>
                    </div>
                </div>
                <div className="page-body animate-fade-up">
                    <XRayResultsDashboard record={historyRecord || result} />
                </div>
            </div>
        );
    }

    const normal = tests.filter(t => t.status?.toLowerCase() === 'normal').length;
    const high   = tests.filter(t => t.status?.toLowerCase() === 'high').length;
    const low    = tests.filter(t => t.status?.toLowerCase() === 'low').length;

    const slideVariants = {
        enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
    };

    return (
        <div style={{ paddingBottom: '6rem' }}>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>{t('results.title')}</h1>
                    <p>{t('results.subtitle')}</p>
                </div>
                <div className="flex-gap">
                    {isTranslating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                            {displayLang === 'hi' ? 'अनुवाद हो रहा है...' : displayLang === 'mr' ? 'भाषांतर होत आहे...' : 'Translating...'}
                        </div>
                    )}
                    <Link to="/upload" className="btn btn-primary">
                        <RefreshCw size={15} /> {t('results.new_report')}
                    </Link>
                </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-body">

                {/* ── ROW 1: FLASHCARD AREA ── */}
                {tests.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <h3 style={{ margin: 0, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.1rem' }}>
                                    <Zap size={18} color="var(--primary)" /> {t('results.test_results')}
                                </h3>
                                <button
                                    onClick={() => setIsGalleryView(!isGalleryView)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        background: isGalleryView ? 'var(--primary)' : 'var(--surface)',
                                        color: isGalleryView ? 'white' : 'var(--text-muted)',
                                        border: '1px solid var(--border)', padding: '4px 10px',
                                        borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700,
                                        cursor: 'pointer', transition: 'all 0.2s',
                                    }}
                                >
                                    {isGalleryView ? <Maximize size={12} /> : <LayoutGrid size={12} />}
                                    {isGalleryView ? (displayLang === 'hi' ? 'स्लाइड' : 'Slide View') : (displayLang === 'hi' ? 'गैलरी' : 'Gallery View')}
                                </button>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {isGalleryView ? (
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        style={{
                                            backgroundColor: '#ffffff',
                                            color: '#000000',
                                            border: '1px solid var(--border)',
                                            padding: '5px 28px 5px 14px',
                                            borderRadius: '20px',
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            outline: 'none',
                                            cursor: 'pointer',
                                            appearance: 'none',
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23000000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'right 10px center',
                                            backgroundSize: '12px 12px',
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <option value="default" style={{ background: '#ffffff', color: '#000000' }}>{displayLang === 'hi' ? 'सॉर्ट: डिफ़ॉल्ट' : 'Sort: Default'}</option>
                                        <option value="high" style={{ background: '#ffffff', color: '#000000' }}>{displayLang === 'hi' ? 'सॉर्ट: उच्च' : 'Sort: High First'}</option>
                                        <option value="low" style={{ background: '#ffffff', color: '#000000' }}>{displayLang === 'hi' ? 'सॉर्ट: निम्न' : 'Sort: Low First'}</option>
                                        <option value="normal" style={{ background: '#ffffff', color: '#000000' }}>{displayLang === 'hi' ? 'सॉर्ट: सामान्य' : 'Sort: Normal First'}</option>
                                    </select>
                                ) : (
                                    <button 
                                        onClick={handleTrendAnalysis}
                                        disabled={isFetchingTrend}
                                        style={{ 
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            background: 'var(--primary)', color: 'white',
                                            border: 'none', padding: '6px 14px', 
                                            borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, 
                                            cursor: isFetchingTrend ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                                            boxShadow: '0 4px 10px rgba(192,21,42,0.3)'
                                        }}
                                    >
                                        {isFetchingTrend ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />}
                                        {displayLang === 'hi' ? 'ट्रेंड विश्लेषण' : 'Trend Analysis'}
                                    </button>
                                )}
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {isGalleryView ? (
                                <motion.div
                                    key="gallery"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    style={{
                                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                                        gap: '1rem'
                                    }}
                                >
                                    {tests.map((test, idx) => ({ ...test, originalIndex: idx }))
                                        .sort((a, b) => {
                                            if (sortBy === 'default') return 0;
                                            const getWeight = (status) => {
                                                const s = status?.toLowerCase();
                                                if (sortBy === 'high') return s === 'high' ? 3 : (s === 'low' ? 2 : (s === 'normal' ? 1 : 0));
                                                if (sortBy === 'low') return s === 'low' ? 3 : (s === 'high' ? 2 : (s === 'normal' ? 1 : 0));
                                                if (sortBy === 'normal') return s === 'normal' ? 3 : 0;
                                                return 0;
                                            };
                                            return getWeight(b.status) - getWeight(a.status);
                                        })
                                        .map((test) => {
                                            const idx = test.originalIndex;
                                            const theme = getTheme(test.status);
                                            return (
                                                <motion.div
                                                    key={`mini-${idx}`}
                                                    whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
                                                    onClick={() => { setCurrentCard(idx); setIsGalleryView(false); }}
                                                    style={{
                                                    background: theme.gradient, borderRadius: '20px',
                                                    padding: '1.25rem', border: `1.5px solid ${theme.cardBorder}`,
                                                    cursor: 'pointer', transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                    <span style={{ fontSize: '0.6rem', color: theme.accent, fontWeight: 800 }}>{theme.label}</span>
                                                    <theme.icon size={14} color="white" />
                                                </div>
                                                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'white', marginBottom: 4 }}>
                                                    {txt(test.test || test.name, test.test_translated)}
                                                </h4>
                                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: theme.accent }}>{test.value}</span>
                                                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>{test.unit}</span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="carousel"
                                    initial={{ opacity: 0, scale: 1.02 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.02 }}
                                >
                                    <div style={{ position: 'relative' }}>
                                        <button onClick={goPrev} disabled={currentCard === 0} style={{ position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: 40, height: 40, borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: currentCard === 0 ? 0.3 : 1 }}><ChevronLeft size={20} /></button>
                                        <button onClick={goNext} disabled={currentCard >= totalCards - 1} style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: 40, height: 40, borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: currentCard >= totalCards - 1 ? 0.3 : 1 }}><ChevronRight size={20} /></button>
                                        <div style={{ overflow: 'hidden', borderRadius: 24, minHeight: 340 }}>
                                            <AnimatePresence mode="wait" custom={direction}>
                                                <motion.div key={currentCard} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                                                    <FlashCard test={tests[currentCard]} index={currentCard} total={totalCards} txt={txt} displayLang={displayLang} />
                                                </motion.div>
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Navigation Map */}
                        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {/* Shortcuts for abnormal results */}
                            {(high > 0 || low > 0) && (
                                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <AlertTriangle size={12} color="#ef4444" /> {displayLang === 'hi' ? 'खतरा:' : 'RISK:'}
                                    </span>
                                    {tests.map((t, i) => {
                                        if (t.status?.toLowerCase() === 'high' || t.status?.toLowerCase() === 'low') {
                                            const tTheme = getTheme(t.status);
                                            return (
                                                <button key={`r-${i}`} onClick={() => { setCurrentCard(i); setIsGalleryView(false); }} style={{ padding: '4px 10px', borderRadius: 12, background: `${tTheme.color}20`, border: `1px solid ${tTheme.color}40`, color: tTheme.color, fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer' }}>
                                                    {txt(t.test || t.name, t.test_translated)}
                                                </button>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            )}
                            {/* Dots */}
                            {/* Dots navigation with extra padding for breathable layout */}
                            <div style={{ 
                                display: 'flex', justifyContent: 'center', gap: 8, 
                                marginTop: '1.5rem', marginBottom: '0.5rem',
                                padding: '12px', background: 'rgba(255,255,255,0.03)',
                                borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                {tests.map((t, i) => {
                                    const dotColor = getTheme(t.status).color;
                                    const active = i === currentCard;
                                    return (
                                        <button 
                                            key={`d-${i}`} 
                                            onClick={() => { setCurrentCard(i); setIsGalleryView(false); }} 
                                            style={{ 
                                                width: active ? 28 : 10, height: 10, borderRadius: 5, 
                                                background: active ? dotColor : `${dotColor}25`, 
                                                border: active ? '1.5px solid white' : 'none', 
                                                cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                padding: 0
                                            }} 
                                            title={txt(t.test || t.name, t.test_translated)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── ROW 2: SUMMARY COUNTERS ── */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                    gap: '1.25rem', 
                    marginBottom: '2rem',
                    marginTop: '0.5rem'
                }}>
                    {/* Health Score Pillar */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="glass-card card-p" 
                        style={{ 
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                            gap: 8, padding: '1.25rem' 
                        }}
                    >
                        <HealthScore score={result.health_score} />
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {result.overall_status || 'HEALTH SCORE'}
                        </div>
                    </motion.div>

                    {/* Normal Stats */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        className="glass-card card-p" 
                        style={{ 
                            background: 'rgba(16,185,129,0.06)', 
                            border: '1px solid rgba(16,185,129,0.15)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                            gap: 4, padding: '1.25rem', position: 'relative', overflow: 'hidden'
                        }}
                    >
                        <CheckCircle2 size={20} color="#10b981" style={{ opacity: 0.8 }} />
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981', lineHeight: '1.2' }}>{normal}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{displayLang === 'hi' ? 'सामान्य' : 'Normal'}</div>
                        <div style={{ position: 'absolute', bottom: -10, right: -10, opacity: 0.05 }}><CheckCircle2 size={60} /></div>
                    </motion.div>

                    {/* High Stats */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                        className="glass-card card-p" 
                        style={{ 
                            background: 'rgba(239,68,68,0.06)', 
                            border: '1px solid rgba(239,68,68,0.15)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                            gap: 4, padding: '1.25rem', position: 'relative', overflow: 'hidden'
                        }}
                    >
                        <TrendingUp size={20} color="#ef4444" style={{ opacity: 0.8 }} />
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ef4444', lineHeight: '1.2' }}>{high}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{displayLang === 'hi' ? 'उच्च' : 'High'}</div>
                        <div style={{ position: 'absolute', bottom: -10, right: -10, opacity: 0.05 }}><TrendingUp size={60} /></div>
                    </motion.div>

                    {/* Low Stats */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                        className="glass-card card-p" 
                        style={{ 
                            background: 'rgba(245,158,11,0.06)', 
                            border: '1px solid rgba(245,158,11,0.15)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                            gap: 4, padding: '1.25rem', position: 'relative', overflow: 'hidden'
                        }}
                    >
                        <TrendingDown size={20} color="#f59e0b" style={{ opacity: 0.8 }} />
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f59e0b', lineHeight: '1.2' }}>{low}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{displayLang === 'hi' ? 'कम' : 'Low'}</div>
                        <div style={{ position: 'absolute', bottom: -10, right: -10, opacity: 0.05 }}><TrendingDown size={60} /></div>
                    </motion.div>
                </div>

                {/* ── ROW 3: AI SUMMARY ── */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card card-p" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Info size={20} color="#38bdf8" />
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{t('results.overall_summary')}</h3>
                        </div>
                        <button
                            onClick={handleVoiceSummary}
                            style={{
                                background: isSpeaking ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                border: 'none', color: 'white', padding: '8px', 
                                borderRadius: '50%', cursor: 'pointer', display: 'flex', 
                                alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                            }}
                            title={isSpeaking ? "Stop Speaking" : "Listen to Summary"}
                        >
                            {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                    </div>
                    <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.7, opacity: 0.9 }}>
                        {txt(result.summary, result.summary_translated) || t('results.summary_not_available')}
                    </p>
                </motion.div>

                {/* FAB */}
                <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setIsChatOpen(true)}
                    style={{
                        position: 'fixed', bottom: 30, right: 30, width: 60, height: 60,
                        borderRadius: '30px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.3)', border: 'none', cursor: 'pointer', zIndex: 100
                    }}
                >
                    <MessageCircle size={24} />
                </motion.button>

                <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} reportData={result} />
            </motion.div>

            {/* ── TREND ANALYSIS MODAL ── */}
            <AnimatePresence>
                {showTrendModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
                        }}
                        onClick={() => setShowTrendModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            style={{
                                background: 'var(--surface)', color: 'var(--text)', borderRadius: 24, padding: '2rem',
                                width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto',
                                position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                                border: '1px solid var(--border)'
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button 
                                onClick={() => setShowTrendModal(false)}
                                style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            >
                                <X size={24} />
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <History size={24} />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{displayLang === 'hi' ? 'ट्रेंड विश्लेषण' : 'Trend Analysis'}</h2>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {trendData?.date ? `${displayLang === 'hi' ? 'तुलना की जा रही है' : 'Compared with'} ${trendData.date}` : displayLang === 'hi' ? 'ऐतिहासिक डेटा की जाच' : 'Checking historical data'}
                                    </p>
                                </div>
                            </div>

                            {trendData?.error ? (
                                <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 16, textAlign: 'center', border: '1px dashed var(--border)' }}>
                                    <AlertTriangle size={32} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                                    <p style={{ margin: 0, fontWeight: 600 }}>{trendData.error}</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {/* Score Comparison Header */}
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 16, padding: '1rem', textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>PREVIOUS SCORE</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{trendData.prevScore || '—'}</div>
                                        </div>
                                        <div style={{ 
                                            flex: 1, 
                                            background: result.health_score >= 80 ? 'rgba(16, 185, 129, 0.1)' : result.health_score >= 60 ? 'rgba(245, 158, 11, 0.1)' : 'var(--primary-light)', 
                                            border: result.health_score >= 80 ? '1px solid #10b981' : result.health_score >= 60 ? '1px solid #f59e0b' : '1px solid var(--primary)', 
                                            borderRadius: 16, padding: '1rem', textAlign: 'center', 
                                            color: result.health_score >= 80 ? '#10b981' : result.health_score >= 60 ? '#f59e0b' : 'var(--primary)' 
                                        }}>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.8, marginBottom: 4 }}>CURRENT SCORE</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{result.health_score}</div>
                                        </div>
                                    </div>

                                    {/* Detailed Table */}
                                    <div className="table-wrap" style={{ borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
                                        <table style={{ margin: 0 }}>
                                            <thead style={{ background: 'var(--surface-muted)' }}>
                                                <tr>
                                                    <th style={{ fontSize: '0.7rem' }}>PARAMETER</th>
                                                    <th style={{ fontSize: '0.7rem', textAlign: 'center' }}>PREV</th>
                                                    <th style={{ fontSize: '0.7rem', textAlign: 'center' }}>CURR</th>
                                                    <th style={{ fontSize: '0.7rem', textAlign: 'right' }}>TREND</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {trendData.comparison?.map((item) => {
                                                    const currentTheme = getTheme(item.status);
                                                    return (
                                                        <tr key={item.name}>
                                                            <td>
                                                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.unit}</div>
                                                            </td>
                                                            <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{item.previous}</td>
                                                            <td style={{ textAlign: 'center', color: currentTheme.color, fontWeight: 800 }}>{item.current}</td>
                                                            <td style={{ textAlign: 'right' }}>
                                                                {item.trend === 'up' && <TrendingUp size={16} color={item.impact === 'improved' ? '#10b981' : item.impact === 'worsened' ? '#ef4444' : '#94a3b8'} style={{ opacity: item.impact === 'stable' ? 0.3 : 1 }} />}
                                                                {item.trend === 'down' && <TrendingDown size={16} color={item.impact === 'improved' ? '#10b981' : item.impact === 'worsened' ? '#ef4444' : '#94a3b8'} style={{ opacity: item.impact === 'stable' ? 0.3 : 1 }} />}
                                                                {item.trend === 'stable' && <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--text-muted)', opacity: 0.15, margin: '0 0 0 auto' }} />}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                                        * Calculated based on reports from {trendData.date} and today.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
