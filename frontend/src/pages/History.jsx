import { useState, useEffect } from 'react';
import { FileText, Trash2, Eye, Loader2 } from 'lucide-react';
import { Badge, EmptyState } from '../components/ui/index.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const statusMap = {
    normal: { label: 'Normal', type: 'success' },
    moderate: { label: 'Moderate', type: 'warning' },
    high: { label: 'High Risk', type: 'error' },
    high_risk: { label: 'High Risk', type: 'error' },
};

const typeOptions = ['All', 'Blood Report', 'X-Ray', 'CT Scan'];

export default function History() {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:5000/api/history');
            const data = await res.json();
            if (data.success) {
                setRecords(data.records || []);
            }
        } catch (err) {
            console.error("Fetch history failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const remove = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/history/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setRecords(prev => prev.filter(r => r.id !== id));
            }
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const filtered = filter === 'All' ? records : records.filter(r => r.type === filter);

    const typeMapping = {
        'All': t('common.all'),
        'Blood Report': t('common.blood_report'),
        'X-Ray': t('common.x_ray'),
        'CT Scan': t('common.ct_scan')
    };

    return (
        <>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>{t('history.title')}</h1>
                    <p>{t('history.subtitle')}</p>
                </div>
                <Link to="/upload" className="btn btn-primary">
                    <FileText size={16} /> {t('common.upload_report')}
                </Link>
            </div>

            <div className="page-body animate-fade-up">
                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    {typeOptions.map(opt => (
                        <button
                            key={opt}
                            onClick={() => setFilter(opt)}
                            className="btn btn-sm"
                            style={{
                                background: filter === opt ? 'linear-gradient(135deg,var(--primary),var(--secondary))' : 'var(--surface)',
                                color: filter === opt ? 'white' : 'var(--text-muted)',
                                border: `1px solid ${filter === opt ? 'transparent' : 'var(--border)'}`,
                                boxShadow: filter === opt ? '0 2px 8px var(--primary-glow)' : 'none',
                            }}
                        >
                            {typeMapping[opt]}
                        </button>
                    ))}
                    <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                        {filtered.length} {t('dashboard.total_reports')}
                    </span>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <Loader2 className="animate-spin mb-2" size={32} />
                        <p>{t('common.processing')}...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon={<FileText size={28} color="var(--text-muted)" />}
                        title={t('common.no_reports_found')}
                        description={t('common.upload_first')}
                        action={<Link to="/upload" className="btn btn-primary">{t('common.upload_report')}</Link>}
                    />
                ) : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t('table.report_name')}</th>
                                    <th>{t('table.date')}</th>
                                    <th>{t('table.type')}</th>
                                    <th>{t('table.health_status')}</th>
                                    <th>{t('table.score')}</th>
                                    <th>{t('common.size')}</th>
                                    <th>{t('table.action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((r) => (
                                    <tr key={r.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                                                <FileText size={15} color="var(--text-muted)" /> {r.name}
                                            </div>
                                        </td>
                                        <td className="text-muted text-sm">{r.date}</td>
                                        <td><Badge type="neutral">{t(`common.${(r.type || 'Blood Report').toLowerCase().replace(' ', '_')}`)}</Badge></td>
                                        <td>
                                            <Badge type={statusMap[r.status]?.type || 'neutral'} dot>
                                                {t(`common.${r.status}`) || r.status}
                                            </Badge>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: '700' }}>{r.score}</span>
                                            <span className="text-muted">/100</span>
                                        </td>
                                        <td className="text-muted text-sm">{r.size}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button 
                                                    onClick={() => navigate('/results', { state: { result: r.result, lang: language } })}
                                                    className="btn btn-outline btn-sm"
                                                >
                                                    <Eye size={13} /> {t('common.view')}
                                                </button>
                                                <button className="btn btn-sm" style={{ background: 'var(--error-bg)', color: 'var(--error)', border: 'none' }}
                                                    onClick={() => remove(r.id)}>
                                                    <Trash2 size={13} /> {t('common.delete')}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
