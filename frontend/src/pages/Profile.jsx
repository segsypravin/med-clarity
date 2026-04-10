import { useState, useEffect } from 'react';
import { User, Calendar, Ruler, Weight, Droplet, AlertTriangle, Activity, Save, ThumbsUp, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

const MEDICAL_CARD = ({ title, icon: Icon, children, color = 'var(--primary)' }) => (
    <div className="card card-p mb-3" style={{ borderLeft: `4px solid ${color}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ 
                width: 36, height: 36, background: 'var(--bg)', color: color, 
                borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${color}33`
            }}>
                <Icon size={18} />
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>{title}</h2>
        </div>
        {children}
    </div>
);

export default function Profile() {
    const { t } = useLanguage();
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    // Profile State
    const [profile, setProfile] = useState({
        fullName: '',
        age: '',
        gender: 'Male',
        bloodGroup: 'Unknown',
        height: '',
        weight: '',
        allergies: '',
        conditions: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!currentUser) return;
            try {
                // Using a more standard path: users/{uid}
                const docRef = doc(db, 'users', currentUser.uid);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists() && docSnap.data().profile) {
                    setProfile(docSnap.data().profile);
                } else {
                    setProfile(prev => ({
                        ...prev,
                        fullName: currentUser.displayName || ''
                    }));
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [currentUser]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!currentUser) return;
        setSaving(true);
        setSuccess(false);

        try {
            // 1. Update Firebase Auth Display Name if changed
            if (profile.fullName && profile.fullName !== currentUser.displayName) {
                await updateProfile(auth.currentUser, { displayName: profile.fullName });
            }

            // 2. Save to Firestore (Standard path: users/{uid})
            const docRef = doc(db, 'users', currentUser.uid);
            await setDoc(docRef, {
                profile: {
                    ...profile,
                    updatedAt: new Date().toISOString()
                }
            }, { merge: true });

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Error saving profile:", error);
            alert(t('profile.profile_error'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <div className="animate-spin" style={{ width: 40, height: 40, border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '840px', margin: '0 auto', padding: '0 1rem 3rem' }}>
            <div className="page-header" style={{ marginBottom: '2.5rem', alignItems: 'flex-end' }}>
                <div className="page-header-left">
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>{t('profile.title')}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{t('profile.subtitle')}</p>
                </div>
                <button 
                    className={`btn ${success ? 'btn-success' : 'btn-primary'}`} 
                    onClick={handleSave}
                    disabled={saving}
                    style={{ gap: '0.6rem', minWidth: '160px', height: '48px', borderRadius: '12px', fontSize: '1rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                >
                    {saving ? '...' : success ? <><ThumbsUp size={20} /> Saved!</> : <><Save size={20} /> {t('profile.save_profile')}</>}
                </button>
            </div>

            <form onSubmit={handleSave} className="animate-fade-up">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
                    
                    {/* ── PERSONAL SECTION ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <MEDICAL_CARD title={t('profile.personal_details')} icon={User} color="#3b82f6">
                            <div className="form-group">
                                <label>{t('profile.full_name')}</label>
                                <input 
                                    type="text" 
                                    value={profile.fullName} 
                                    onChange={e => setProfile(prev => ({...prev, fullName: e.target.value}))}
                                    placeholder="e.g. John Doe"
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>{t('profile.age')}</label>
                                    <input 
                                        type="number" 
                                        value={profile.age} 
                                        onChange={e => setProfile(prev => ({...prev, age: e.target.value}))}
                                        placeholder="Age"
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>{t('profile.gender')}</label>
                                    <select 
                                        value={profile.gender} 
                                        onChange={e => setProfile(prev => ({...prev, gender: e.target.value}))}
                                    >
                                        <option value="Male">{t('profile.male')}</option>
                                        <option value="Female">{t('profile.female')}</option>
                                        <option value="Other">{t('profile.other')}</option>
                                    </select>
                                </div>
                            </div>
                        </MEDICAL_CARD>

                        <MEDICAL_CARD title={t('profile.medical_details')} icon={Droplet} color="#ef4444">
                            <div className="form-group">
                                <label>{t('profile.blood_group')}</label>
                                <select 
                                    value={profile.bloodGroup} 
                                    onChange={e => setProfile(prev => ({...prev, bloodGroup: e.target.value}))}
                                >
                                    <option value="Unknown">Select...</option>
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                        <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Ruler size={14} /> {t('profile.height')}
                                    </label>
                                    <input 
                                        type="number" 
                                        value={profile.height} 
                                        onChange={e => setProfile(prev => ({...prev, height: e.target.value}))}
                                        placeholder="cm"
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Weight size={14} /> {t('profile.weight')}
                                    </label>
                                    <input 
                                        type="number" 
                                        value={profile.weight} 
                                        onChange={e => setProfile(prev => ({...prev, weight: e.target.value}))}
                                        placeholder="kg"
                                    />
                                </div>
                            </div>
                        </MEDICAL_CARD>
                    </div>

                    {/* ── HEALTH HISTORY SECTION ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <MEDICAL_CARD title={t('profile.allergies')} icon={AlertTriangle} color="#f59e0b">
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <textarea 
                                    value={profile.allergies} 
                                    onChange={e => setProfile(prev => ({...prev, allergies: e.target.value}))}
                                    placeholder="e.g. Peanuts, Penicillin, Dust..."
                                    style={{ minHeight: '120px', resize: 'vertical' }}
                                />
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                    List all known food or drug allergies.
                                </p>
                            </div>
                        </MEDICAL_CARD>

                        <MEDICAL_CARD title={t('profile.chronic_conditions')} icon={Activity} color="#8b5cf6">
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <textarea 
                                    value={profile.conditions} 
                                    onChange={e => setProfile(prev => ({...prev, conditions: e.target.value}))}
                                    placeholder="e.g. Diabetes, Hypertension, Asthma..."
                                    style={{ minHeight: '120px', resize: 'vertical' }}
                                />
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                    Include any long-term medical conditions or surgeries.
                                </p>
                            </div>
                        </MEDICAL_CARD>
                    </div>

                </div>
            </form>

            <div style={{ 
                marginTop: '3rem', padding: '1.5rem', borderRadius: '16px', 
                background: 'var(--surface)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'flex-start', gap: '1rem' 
            }}>
                <div style={{ color: 'var(--primary)', marginTop: '0.2rem' }}><Info size={20} /></div>
                <div>
                    <h4 style={{ margin: '0 0 0.4rem', fontWeight: 700, fontSize: '0.95rem' }}>Privacy Information</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        Your medical profile is stored securely and is only accessible to you. This information helps our AI provide more relevant context when analyzing your reports. We never share your personal health data with third parties.
                    </p>
                </div>
            </div>
        </div>
    );
}
