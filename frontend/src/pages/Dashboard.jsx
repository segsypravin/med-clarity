import { FileText, Activity, TrendingUp, Users, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard, Badge, HealthScore } from '../components/ui/index.jsx';

const recentReports = [];

const statusMap = {
    success: { label: 'Normal', type: 'success' },
    warning: { label: 'Moderate', type: 'warning' },
    error: { label: 'High Risk', type: 'error' },
};

export default function Dashboard() {
    return (
        <>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Dashboard</h1>
                    <p>Welcome back! Here's your health overview.</p>
                </div>
                <Link to="/upload" className="btn btn-primary">
                    <FileText size={16} /> Upload Report
                </Link>
            </div>

            <div className="page-body animate-fade-up">
                {/* Stats */}
                <div className="stat-grid">
                    <StatCard icon={<FileText size={22} />} label="Total Reports" value="0" sub="All time uploads" colorClass="red" />
                    <StatCard icon={<Activity size={22} />} label="Latest Health Score" value="-" sub="No reports yet" colorClass="green" />
                    <StatCard icon={<TrendingUp size={22} />} label="Analyses Done" value="0" sub="AI-powered insights" colorClass="blue" />
                    <StatCard icon={<Users size={22} />} label="Doctors Nearby" value="0" sub="Based on your location" colorClass="amber" />
                </div>

                <div className="grid-2">
                    {/* Health Score */}
                    <div className="card card-p">
                        <h2 className="section-title">Latest Health Score</h2>
                        {recentReports.length > 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '1rem' }}>
                                <HealthScore score={82} size={130} />
                                <div>
                                    <Badge type="success" dot>Normal</Badge>
                                    <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                        Your blood test results look great. Hemoglobin and WBC levels are within normal range.
                                    </p>
                                    <Link to="/results" className="btn btn-outline btn-sm" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                                        View Full Results <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <p>No health score available. Upload a report to get started.</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="card card-p">
                        <h2 className="section-title">Quick Actions</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                            {[
                                { to: '/upload', icon: FileText, label: 'Upload a new report', desc: 'PDF, image, CT scan, X-ray' },
                                { to: '/doctors', icon: Users, label: 'Find a specialist', desc: 'Based on your health results' },
                                { to: '/history', icon: Clock, label: 'View report history', desc: 'All past uploads & analyses' },
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
                        <h2 className="section-title" style={{ marginBottom: 0 }}>Recent Reports</h2>
                        <Link to="/history" className="btn btn-ghost btn-sm">View all →</Link>
                    </div>
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Report Name</th>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Health Status</th>
                                    <th>Score</th>
                                    <th>Action</th>
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
                                            <Link to="/results" className="btn btn-outline btn-sm">View</Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                            No recent reports found.
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
