"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';

type Language = 'ja' | 'en';

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    isMember: boolean;
    isOperational: boolean;
    roles: string[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Language>('ja');

    useEffect(() => {
        const savedLang = localStorage.getItem('ggbof-lang') as Language;
        if (savedLang && (savedLang === 'ja' || savedLang === 'en')) {
            setLangState(savedLang);
        }
    }, []);

    const { user } = useUser();
    
    const { isMember, isOperational, roles } = useMemo(() => {
        const rawRole = user?.publicMetadata?.role;
        const rolesArr = Array.isArray(rawRole) ? rawRole : [rawRole || 'guest'];
        return {
            isMember: rolesArr.includes('member') || rolesArr.includes('paid'),
            isOperational: rolesArr.includes('admin') || rolesArr.includes('staff'),
            roles: rolesArr
        };
    }, [user]);

    const setLang = (newLang: Language) => {
        setLangState(newLang);
        localStorage.setItem('ggbof-lang', newLang);
    };

    const contextValue = useMemo(() => ({
        lang,
        setLang,
        isMember,
        isOperational,
        roles
    }), [lang, isMember, isOperational, roles]);

    return (
        <LanguageContext.Provider value={contextValue}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
