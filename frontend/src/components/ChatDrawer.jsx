import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, MessageCircle, AlertCircle, Loader2, Sparkles, ClipboardList, HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { auth } from '../firebase';
import config from '../config';

const ChatDrawer = ({ isOpen, onClose, reportData }) => {
    const { language: lang, t } = useLanguage();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    // Initial greeting
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const greeting = lang === 'hi' 
                ? "नमस्ते! मैं आपका MEDClarity AI कोच हूँ। मैं आपकी रिपोर्ट को समझने में आपकी मदद कर सकता हूँ। आप कुछ भी पूछ सकते हैं!" 
                : lang === 'mr'
                ? "नमस्कार! मी तुमचा MEDClarity AI कोच आहे. मी तुम्हाला तुमचा रिपोर्ट समजून घेण्यास मदत करू शकतो. तुम्ही काहीही विचारू शकता!"
                : "Hello! I'm your MEDClarity AI Coach. I've analyzed your report and I'm ready to help you understand it. What would you like to know?";
            
            setMessages([{ role: 'model', content: greeting }]);
        }
    }, [isOpen, lang]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSendMessage = async (e, suggestedText = null) => {
        if (e) e.preventDefault();
        const textToSearch = suggestedText || input;
        if (!textToSearch.trim() || isLoading) return;

        const userMsg = { role: 'user', content: textToSearch };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
            const res = await fetch(`${config.API_BASE}/api/analyze/chat`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({
                    report_data: reportData,
                    query: textToSearch,
                    history: messages,
                    lang: lang
                })
            });

            const data = await res.json();
            if (data.response) {
                setMessages(prev => [...prev, { role: 'model', content: data.response }]);
            } else {
                throw new Error('No response from AI');
            }
        } catch (error) {
            console.error('Chat Error:', error);
            const errorMsg = lang === 'hi' 
                ? "माफ़ कीजिए, मुझे जवाब देने में समस्या हो रही है।" 
                : "Sorry, I'm having trouble connecting right now.";
            setMessages(prev => [...prev, { role: 'model', content: errorMsg }]);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestions = [
        { en: "Summarize this report", hi: "इस रिपोर्ट का सारांश दें", mr: "या रिपोर्टचा सारांश द्या", icon: <ClipboardList size={14} /> },
        { en: "What should I eat?", hi: "मुझे क्या खाना चाहिए?", mr: "मी काय खावे?", icon: <Sparkles size={14} /> },
        { en: "Questions for my doctor", hi: "डॉक्टर के लिए सवाल", mr: "डॉक्टरांसाठी प्रश्न", icon: <HelpCircle size={14} /> }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
                            backdropFilter: 'blur(4px)', zIndex: 1000,
                        }}
                    />

                    {/* Side Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{
                            position: 'fixed', top: 0, right: 0, width: 'min(450px, 90vw)',
                            height: '100vh', background: 'var(--surface)', zIndex: 1001,
                            boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', color: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ background: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 12 }}>
                                    <Bot size={22} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>MEDClarity AI</div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 500 }}>Online Health Coach</div>
                                </div>
                            </div>
                            <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', color: 'white', padding: 6, borderRadius: '50%', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Chat Messages */}
                        <div 
                            ref={scrollRef}
                            style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                        >
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        display: 'flex', gap: 10,
                                        flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                                        alignItems: 'flex-start'
                                    }}
                                >
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                        background: msg.role === 'user' ? 'var(--primary-light)' : 'var(--bg)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: msg.role === 'user' ? 'var(--primary)' : 'var(--text-muted)'
                                    }}>
                                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                    </div>
                                    <div style={{
                                        maxWidth: '80%', padding: '0.875rem 1rem', borderRadius: 18,
                                        fontSize: '0.9rem', lineHeight: 1.5,
                                        background: msg.role === 'user' ? 'var(--primary)' : '#f3f4f6',
                                        color: msg.role === 'user' ? 'white' : 'var(--text)',
                                        borderTopRightRadius: msg.role === 'user' ? 4 : 18,
                                        borderTopLeftRadius: msg.role === 'model' ? 4 : 18,
                                        boxShadow: msg.role === 'user' ? '0 4px 12px var(--primary-glow)' : 'none'
                                    }}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Bot size={16} className="animate-spin" />
                                    </div>
                                    <div style={{ background: '#f3f4f6', padding: '0.875rem 1.25rem', borderRadius: 18, borderTopLeftRadius: 4 }}>
                                        <Loader2 size={16} className="animate-spin" color="var(--text-muted)" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Suggestions */}
                        {messages.length === 1 && !isLoading && (
                            <div style={{ padding: '0 1.5rem 1rem', display: 'flex', gap: 8, overflowX: 'auto', flexShrink: 0 }}>
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSendMessage(null, s[lang] || s.en)}
                                        style={{
                                            whiteSpace: 'nowrap', padding: '8px 14px', borderRadius: 20,
                                            border: '1px solid var(--border)', background: 'var(--surface)',
                                            fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)',
                                            display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.color = 'var(--primary)'; }}
                                        onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-muted)'; }}
                                    >
                                        {s.icon} {s[lang] || s.en}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input Area */}
                        <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border)' }}>
                            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 10, position: 'relative' }}>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={lang === 'hi' ? "सवाल पूछें..." : "Ask me anything..."}
                                    style={{
                                        flex: 1, padding: '0.875rem 1.25rem', paddingRight: '3.5rem',
                                        borderRadius: 24, border: '1px solid var(--border)',
                                        background: 'var(--bg)', fontSize: '0.9rem', outline: 'none'
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    style={{
                                        position: 'absolute', right: 6, top: 6, bottom: 6, width: 36,
                                        background: 'var(--primary)', color: 'white', border: 'none',
                                        borderRadius: '50%', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', cursor: 'pointer',
                                        transition: 'all 0.2s', opacity: (!input.trim() || isLoading) ? 0.5 : 1
                                    }}
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                            
                            {/* Disclaimer */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: '1rem', color: 'var(--text-light)', fontSize: '0.65rem', justifyContent: 'center' }}>
                                <AlertCircle size={12} />
                                AI assistant is for informational purposes only. Consult a doctor.
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ChatDrawer;
