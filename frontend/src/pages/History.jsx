import { useState } from 'react';
import { FileText, Trash2, Eye } from 'lucide-react';
import { Badge, EmptyState } from '../components/ui/index.jsx';
import { Link } from 'react-router-dom';

const SAMPLE_HISTORY = [
    { id: 1, name: 'Blood_Test_Report.pdf', date: 'Feb 21, 2026', type: 'Blood Report', status: 'normal', score: 82, size: '1.2 MB' },
    { id: 2, name: 'Chest_XRay_Feb.jpg', date: 'Feb 18, 2026', type: 'X-Ray', status: 'moderate', score: 61, size: '3.4 MB' },
    { id: 3, name: 'CT_Scan_Abdomen.jpg', date: 'Feb 10, 2026', type: 'CT Scan', status: 'high', score: 38, size: '5.8 MB' },
    { id: 4, name: 'Lipid_Panel_Jan.pdf', date: 'Jan 30, 2026', type: 'Blood Report', status: 'moderate', score: 54, size: '0.9 MB' },
    { id: 5, name: 'Thyroid_Profile.pdf', date: 'Jan 12, 2026', type: 'Blood Report', status: 'normal', score: 78, size: '1.1 MB' },
];

const statusMap = {
    normal: { label: 'Normal', type: 'success' },
    moderate: { label: 'Moderate', type: 'warning' },
    high: { label: 'High Risk', type: 'error' },
};

const typeOptions = ['All', 'Blood Report', 'X-Ray', 'CT Scan'];

export default function History() {
    const [records, setRecords] = useState(SAMPLE_HISTORY);
    const [filter, setFilter] = useState('All');

    const filtered = filter === 'All' ? records : records.filter(r => r.type === filter);
    const remove = (id) => setRecords(prev => prev.filter(r => r.id !== id));

    return (
        <>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Report History</h1>
                    <p>All your uploaded reports and analysis results.</p>
                </div>
                <Link to="/upload" className="btn btn-primary">
                    <FileText size={16} /> Upload New
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
                            {opt}
                        </button>
                    ))}
                    <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                        {filtered.length} report{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {filtered.length === 0 ? (
                    <EmptyState
                        icon={<FileText size={28} color="var(--text-muted)" />}
                        title="No reports found"
                        description="Upload your first medical report to get started."
                        action={<Link to="/upload" className="btn btn-primary">Upload Report</Link>}
                    />
                ) : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Report Name</th>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Health Status</th>
                                    <th>Score</th>
                                    <th>Size</th>
                                    <th>Actions</th>
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
                                        <td><Badge type="neutral">{r.type}</Badge></td>
                                        <td><Badge type={statusMap[r.status].type} dot>{statusMap[r.status].label}</Badge></td>
                                        <td>
                                            <span style={{ fontWeight: '700' }}>{r.score}</span>
                                            <span className="text-muted">/100</span>
                                        </td>
                                        <td className="text-muted text-sm">{r.size}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <Link to="/results" className="btn btn-outline btn-sm">
                                                    <Eye size={13} /> View
                                                </Link>
                                                <button className="btn btn-sm" style={{ background: 'var(--error-bg)', color: 'var(--error)', border: 'none' }}
                                                    onClick={() => remove(r.id)}>
                                                    <Trash2 size={13} />
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
