'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { ArrowRight, Compass, Layout, BookOpen } from 'lucide-react';

export default function HomePage() {
    const { lang } = useLanguage();

    const sections = [
        {
            id: 'somrie',
            title: lang === 'ja' ? 'SOMRIE' : 'SOMRIE',
            description: lang === 'ja' ? 'シニアたちの語り場。経験を価値に変えるコミュニティ。' : 'A place for seniors to talk. A community that turns experience into value.',
            href: '/members',
            icon: <Compass className="w-6 h-6" />,
            color: '#4f46e5'
        },
        {
            id: 'abc',
            title: 'Activity by Contract',
            description: lang === 'ja' ? '活動を「契約」として捉え、組織の柔軟性と信頼性を高める設計手法。' : 'A design method that treats activities as "contracts" to enhance organizational flexibility.',
            href: '/abc',
            icon: <Layout className="w-6 h-6" />,
            color: '#10b981'
        },
        {
            id: 'pattern',
            title: lang === 'ja' ? 'パターンカタログ' : 'Pattern Catalog',
            description: lang === 'ja' ? '組織改善の「観点」と、それを解決する「モデル」のライブラリ。' : 'A library of "viewpoints" for organizational improvement and "models" to solve them.',
            href: '/pattern/views',
            icon: <BookOpen className="w-6 h-6" />,
            color: '#f59e0b'
        }
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f8faff', paddingTop: '120px', paddingBottom: '80px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
                <header style={{ textAlign: 'center', marginBottom: '64px' }}>
                    <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#1a192b', marginBottom: '16px', letterSpacing: '-0.03em' }}>
                        GGBOF
                    </h1>
                    <p style={{ fontSize: '18px', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                        {lang === 'ja' 
                            ? '組織の知恵と活動を構造化し、持続的な進化を支えるプラットフォーム' 
                            : 'A platform to structure organizational wisdom and activities, supporting sustainable evolution.'}
                    </p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    {sections.map((section) => (
                        <Link 
                            key={section.id} 
                            href={section.href}
                            style={{ 
                                textDecoration: 'none',
                                background: '#fff',
                                padding: '32px',
                                borderRadius: '20px',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 12px 20px -8px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
                            }}
                        >
                            <div style={{ 
                                width: '48px', 
                                height: '48px', 
                                background: `${section.color}10`, 
                                color: section.color,
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '20px'
                            }}>
                                {section.icon}
                            </div>
                            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1a192b', marginBottom: '12px' }}>
                                {section.title}
                            </h2>
                            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, marginBottom: '24px', flex: 1 }}>
                                {section.description}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: section.color, fontSize: '14px', fontWeight: 700 }}>
                                {lang === 'ja' ? '詳細を見る' : 'Learn more'}
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </Link>
                    ))}
                </div>

                <footer style={{ marginTop: '80px', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '40px' }}>
                    <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                        &copy; 2026 GGBOF Institute. All rights reserved.
                    </p>
                </footer>
            </div>
        </div>
    );
}
