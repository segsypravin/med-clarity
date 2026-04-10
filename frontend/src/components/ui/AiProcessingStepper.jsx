import React, { useEffect, useState } from 'react';
import { Loader2, Zap, FileSearch } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export function AiProcessingStepper() {
    const [step, setStep] = useState(0);

    const steps = [
        { icon: <FileSearch size={24} />, text: 'Scanning Document...', label: 'Scanning', desc: 'Extracting medical text and values.' },
        { icon: <Loader2 className="spinner" size={24} />, text: 'Analyzing Results...', label: 'Analyzing', desc: 'Cross-referencing with medical databases.' },
        { icon: <Zap size={24} />, text: 'Synthesizing Summary...', label: 'Synthesizing', desc: 'Generating plain English explanations.' }
    ];

    useEffect(() => {
        const t1 = setTimeout(() => setStep(1), 3000);
        const t2 = setTimeout(() => setStep(2), 6500);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    return (
        <div className="stepper-wrap" style={{ textAlign: 'center', padding: '2rem 0' }}>
            <motion.div 
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ marginBottom: '2rem' }}
            >
                <div style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                    {steps[step].icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>
                    {steps[step].text}
                </h3>
                <p style={{ color: 'var(--text-muted)' }}>{steps[step].desc}</p>
            </motion.div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {steps.map((s, i) => (
                    <motion.div 
                        key={i}
                        animate={{ 
                            background: i <= step ? 'var(--primary)' : 'var(--border)',
                            scale: i === step ? 1.1 : 1
                        }}
                        style={{
                            width: i === step ? '40px' : '12px',
                            height: '8px',
                            borderRadius: '4px',
                            transition: 'all 0.3s ease'
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
