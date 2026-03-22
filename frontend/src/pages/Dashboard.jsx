import { FileText, Activity, TrendingUp, Users, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard, Badge, HealthScore } from '../components/ui/index.jsx';
import { useLanguage } from '../context/LanguageContext';

const recentReports = [];

export default function Dashboard() {
    const { t } = useLanguage();

    const statusMap = {
        success: { label: t('common.normal'), type: 'success' },
        warning: { label: t('common.moderate'), type: 'warning' },
        error: { label: t('common.high_risk'), type: 'error' },
    };

    return (
        <>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>{t('common.dashboard')}</h1>
                    <p>{t('dashboard.subtitle')}</p>
                </div>
                <Link to="/upload" className="btn btn-primary">
                    <FileText size={16} /> {t('common.upload_report')}
                </Link>
            </div>

            <div className="page-body animate-fade-up">
                {/* Stats */}
                <div className="stat-grid">
                    <StatCard icon={<FileText size={22} />} label={t('dashboard.total_reports')} value="0" sub={t('dashboard.all_time_uploads')} colorClass="red" />
                    <StatCard icon={<Activity size={22} />} label={t('dashboard.latest_health_score')} value="-" sub={t('dashboard.no_reports_yet')} colorClass="green" />
                    <StatCard icon={<TrendingUp size={22} />} label={t('dashboard.analyses_done')} value="0" sub={t('dashboard.ai_powered_insights')} colorClass="blue" />
                    <StatCard icon={<Users size={22} />} label={t('dashboard.doctors_nearby')} value="0" sub={t('dashboard.based_on_location')} colorClass="amber" />
                </div>

                <div className="grid-2">
                    {/* Health Score */}
                    <div className="card card-p">
                        <h2 className="section-title">{t('dashboard.latest_health_score')}</h2>
                        {recentReports.length > 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '1rem' }}>
                                <HealthScore score={82} size={130} />
                                <div>
                                    <Badge type="success" dot>{t('common.success')}</Badge>
                                    <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                        {t('common.mock_summary')}
                                    </p>
                                    <Link to="/results" className="btn btn-outline btn-sm" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                                        {t('dashboard.view_full_results')} <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <p>{t('dashboard.no_score_msg')}</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="card card-p">
                        <h2 className="section-title">{t('dashboard.quick_actions')}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                            {[
                                { to: '/upload', icon: FileText, label: t('common.upload_report'), desc: t('dashboard.upload_new_desc') },
                                { to: '/doctors', icon: Users, label: t('common.find_doctors'), desc: t('dashboard.find_specialist_desc') },
                                { to: '/history', icon: Clock, label: t('common.history'), desc: t('dashboard.view_history_desc') },
                            ].map(({ to, icon: Icon, label, desc }) => (
                                <Link key={to} to={to} style={{
                                    display: 'flex', alignItems: 'center', gap: '1rem',
                                    padding: '0.875rem', borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border)', textDecoration: 'none',
                                    color: 'var(--text)', transition: 'all 0.15s',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-red)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div style={{ width: 38, height: 38, borderRadius: 8, background: 'var(--error-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Icon size={18} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{label}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{desc}</div>
                                    </div>
                                    <ArrowRight size={16} color="var(--text-light)" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Reports */}
                <div style={{ marginTop: '1.5rem' }}>
                    <div className="flex-between mb-2">
                        <h2 className="section-title" style={{ marginBottom: 0 }}>{t('dashboard.recent_reports')}</h2>
                        <Link to="/history" className="btn btn-ghost btn-sm">{t('dashboard.view_all')} →</Link>
                    </div>
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t('table.report_name')}</th>
                                    <th>{t('table.date')}</th>
                                    <th>{t('table.type')}</th>
                                    <th>{t('table.health_status')}</th>
                                    <th>{t('table.score')}</th>
                                    <th>{t('table.action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentReports.length > 0 ? recentReports.map((r) => (
                                    <tr key={r.name}>
                                        <td style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FileText size={15} color="var(--text-muted)" /> {r.name}
                                        </td>
                                        <td className="text-muted">{r.date}</td>
                                        <td><Badge type="neutral">{r.type}</Badge></td>
                                        <td><Badge type={statusMap[r.status].type} dot>{statusMap[r.status].label}</Badge></td>
                                        <td style={{ fontWeight: '700' }}>{r.score}<span className="text-muted" style={{ fontWeight: 400 }}>/100</span></td>
                                        <td>
                                            <Link to="/results" className="btn btn-outline btn-sm">{t('table.action')}</Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                            {t('table.no_recent')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
