// Badge component — status chip
export function Badge({ type = 'neutral', children, dot = false }) {
    return (
        <span className={`badge badge-${type}`}>
            {dot && (
                <span style={{
                    width: 6, height: 6,
                    borderRadius: '50%',
                    background: 'currentColor',
                    display: 'inline-block',
                }} />
            )}
            {children}
        </span>
    );
}

// Spinner component
export function Spinner({ size = 20 }) {
    return (
        <svg
            className="animate-spin"
            width={size} height={size}
            viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5"
        >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                strokeLinecap="round" />
        </svg>
    );
}

// EmptyState component
export function EmptyState({ icon, title, description, action }) {
    return (
        <div className="empty-state animate-fade-up">
            <div className="empty-icon">{icon}</div>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text)', marginBottom: '0.4rem' }}>
                {title}
            </h3>
            {description && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem', maxWidth: '320px', margin: '0 auto 1.25rem' }}>
                    {description}
                </p>
            )}
            {action}
        </div>
    );
}

// StatCard component
export function StatCard({ icon, label, value, sub, colorClass = 'red' }) {
    return (
        <div className="stat-card animate-fade-up">
            <div className={`stat-icon ${colorClass}`}>{icon}</div>
            <div>
                <div className="stat-label">{label}</div>
                <div className="stat-value">{value}</div>
                {sub && <div className="stat-sub">{sub}</div>}
            </div>
        </div>
    );
}

// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

// HealthScore ring component  
export function HealthScore({ score = 0, size = 140 }) {
    const radius = (size - 16) / 2;
    const circ = 2 * Math.PI * radius;
    const color = score >= 75 ? '#059669' : score >= 50 ? '#d97706' : '#c0152a';

    return (
        <div className="score-ring-wrap">
            <div className="score-ring" style={{ width: size, height: size }}>
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx={size / 2} cy={size / 2} r={radius}
                        fill="none" stroke="var(--border)" strokeWidth="12" />
                    <motion.circle 
                        cx={size / 2} cy={size / 2} r={radius}
                        fill="none" stroke={color} strokeWidth="12"
                        initial={{ strokeDashoffset: circ }}
                        animate={{ 
                            strokeDashoffset: circ - (score / 100) * circ,
                            scale: score >= 80 ? [1, 1.05, 1] : 1
                        }}
                        transition={{ 
                            strokeDashoffset: { duration: 1.5, ease: "easeOut" },
                            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                        }}
                        strokeDasharray={circ}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="score-ring-label">
                    <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="score-ring-value" 
                        style={{ color }}
                    >
                        {score}
                    </motion.span>
                    <span className="score-ring-subtitle">/ 100</span>
                </div>
            </div>
        </div>
    );
}
