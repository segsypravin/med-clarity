import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../locales/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Load saved language or default to English
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('appLanguage') || 'en';
    });

    // Audio settings
    const [audioSettings, setAudioSettings] = useState(() => {
        const saved = localStorage.getItem('appAudioSettings');
        return saved ? JSON.parse(saved) : {
            enabled: true,
            autoplay: false,
            speed: 'normal'
        };
    });

    useEffect(() => {
        localStorage.setItem('appLanguage', language);
    }, [language]);

    useEffect(() => {
        localStorage.setItem('appAudioSettings', JSON.stringify(audioSettings));
    }, [audioSettings]);

    const updateAudioSettings = (newSettings) => {
        setAudioSettings(prev => ({ ...prev, ...newSettings }));
    };

    const t = (key) => {
        const keys = key.split('.');
        let result = translations[language];
        
        for (const k of keys) {
            if (result && result[k] !== undefined) {
                result = result[k];
            } else {
                // Fallback to English if key missing in target language
                let fallback = translations['en'];
                for (const fk of keys) {
                    if (fallback && fallback[fk] !== undefined) {
                        fallback = fallback[fk];
                    } else {
                        return key; // Return key itself if all fails
                    }
                }
                return fallback;
            }
        }
        return result;
    };

    return (
        <LanguageContext.Provider value={{ 
            language, setLanguage, 
            audioSettings, updateAudioSettings,
            t 
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
