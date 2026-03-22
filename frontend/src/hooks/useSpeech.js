import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';

export const useSpeech = () => {
    const { language, audioSettings } = useLanguage();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState([]);

    // Map internal language codes to BCP-47 tags
    const langMap = { en: 'en-US', hi: 'hi-IN', mr: 'mr-IN' };

    useEffect(() => {
        const loadVoices = () => {
            const available = window.speechSynthesis.getVoices();
            if (available.length > 0) setVoices(available);
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        return () => { window.speechSynthesis.onvoiceschanged = null; };
    }, []);

    const stop = useCallback(() => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    const speak = useCallback((text) => {
        if (!audioSettings.enabled || !text) return;
        window.speechSynthesis.cancel();

        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(text);
            const bcp47 = langMap[language] || 'en-US';
            utterance.lang = bcp47;

            const speedMap = { slow: 0.8, normal: 1.0, fast: 1.3 };
            utterance.rate = speedMap[audioSettings.speed] || 1.0;

            // Find best matching voice
            const voice = voices.find(v => v.lang === bcp47 && v.name.includes('Google'))
                        || voices.find(v => v.lang === bcp47)
                        || voices.find(v => v.lang.startsWith(language));
            if (voice) utterance.voice = voice;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
        }, 100);
    }, [language, audioSettings, voices]); // eslint-disable-line

    useEffect(() => () => window.speechSynthesis.cancel(), []);

    return { speak, stop, isSpeaking };
};
