"use client";
export const runtime = "edge";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowRight,
    Layers,
    Workflow,
    ShieldCheck,
    Database,
    Zap,
    ChevronRight,
    BookOpen,
    Cpu,
    Languages
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { translations } from './translations';

export default function AbCLandingPage() {
    const { lang } = useLanguage();
    const t = translations[lang];

    const gradientTextStyle = {
        background: 'linear-gradient(135deg, #1a192b 0%, #4a495b 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    };

    const featureCardStyle: React.CSSProperties = {
        padding: '32px',
        background: '#fff',
        borderRadius: '24px',
        border: '1px solid #f0f0f0',
        boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
        transition: 'all 0.3s ease',
    };

    const langToggleStyle: React.CSSProperties = {
        position: 'fixed',
        top: '80px',
        right: '24px',
        background: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '100px',
        padding: '4px',
        display: 'flex',
        gap: '4px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        zIndex: 100
    };

    const langButtonStyle = (active: boolean): React.CSSProperties => ({
        padding: '6px 12px',
        borderRadius: '100px',
        fontSize: '12px',
        fontWeight: 700,
        cursor: 'pointer',
        border: 'none',
        background: active ? '#1a192b' : 'transparent',
        color: active ? '#fff' : '#666',
        transition: 'all 0.2s'
    });

    return (
        <div style={{ minHeight: '100vh', background: '#fff', color: '#1a192b', paddingTop: '64px', fontFamily: 'Inter, sans-serif' }}>


            {/* Hero Section */}
            <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: '#f0f2ff',
                    borderRadius: '100px',
                    color: '#2d5cf7',
                    fontSize: '14px',
                    fontWeight: 700,
                    marginBottom: '24px'
                }}>
                    <Zap size={14} fill="currentColor" />
                    {t.heroTag}
                </div>

                <h1 style={{
                    fontSize: 'clamp(40px, 8vw, 72px)',
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    lineHeight: 1.1,
                    marginBottom: '24px',
                    ...gradientTextStyle
                }}>
                    {t.title}
                </h1>

                <p style={{
                    fontSize: '20px',
                    color: '#666',
                    maxWidth: '800px',
                    margin: '0 auto 40px',
                    lineHeight: 1.6
                }}>
                    {t.heroDesc}
                </p>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/abc/modeler" style={{
                        padding: '16px 32px',
                        background: '#1a192b',
                        color: '#fff',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                    }}>
                        {t.openModeler} <ArrowRight size={20} />
                    </Link>
                    <button style={{
                        padding: '16px 32px',
                        background: '#fff',
                        color: '#1a192b',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: 700,
                        border: '1px solid #e0e0e0',
                        cursor: 'not-allowed',
                        opacity: 0.6
                    }}>
                        {t.viewDocs}
                    </button>
                </div>
            </section>

            {/* Overview Section */}
            <section style={{ padding: '80px 24px', background: '#fcfcfc', borderTop: '1px solid #f0f0f0' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px' }}>{t.whatIsAbc}</h2>
                        <div style={{ width: '60px', height: '4px', background: '#2d5cf7', margin: '0 auto' }}></div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                        <div style={featureCardStyle}>
                            <div style={{ width: '48px', height: '48px', background: '#e3f2fd', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2196f3', marginBottom: '24px' }}>
                                <ShieldCheck size={28} />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>{t.feature1Title}</h3>
                            <p style={{ color: '#666', lineHeight: 1.6, fontSize: '15px' }}>
                                {t.feature1Desc}
                            </p>
                        </div>

                        <div style={featureCardStyle}>
                            <div style={{ width: '48px', height: '48px', background: '#e8f5e9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4caf50', marginBottom: '24px' }}>
                                <Workflow size={28} />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>{t.feature2Title}</h3>
                            <p style={{ color: '#666', lineHeight: 1.6, fontSize: '15px' }}>
                                {t.feature2Desc}
                            </p>
                        </div>

                        <div style={featureCardStyle}>
                            <div style={{ width: '48px', height: '48px', background: '#fff3e0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff9800', marginBottom: '24px' }}>
                                <Database size={28} />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>{t.feature3Title}</h3>
                            <p style={{ color: '#666', lineHeight: 1.6, fontSize: '15px' }}>
                                {t.feature3Desc}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sample Models Section */}
            <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px' }}>{t.sampleTitle}</h2>
                    <p style={{ color: '#666' }}>{t.sampleSubtitle}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '40px' }}>
                    <div style={{ ...featureCardStyle, padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ background: '#f8f9fa', padding: '20px', display: 'flex', justifyContent: 'center', borderBottom: '1px solid #f0f0f0' }}>
                            <img src="/abc/images/abc_concept.png" alt={t.sampleConceptTitle} style={{ maxWidth: '100%', height: 'auto', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                        </div>
                        <div style={{ padding: '24px' }}>
                            <h4 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Zap size={20} color="#2196f3" /> {t.sampleConceptTitle}
                            </h4>
                            <p style={{ color: '#666', lineHeight: 1.6, fontSize: '15px' }}>
                                {t.sampleConceptDesc}
                            </p>
                        </div>
                    </div>

                    <div style={{ ...featureCardStyle, padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ background: '#f8f9fa', padding: '20px', display: 'flex', justifyContent: 'center', borderBottom: '1px solid #f0f0f0' }}>
                            <img src="/abc/images/abc_sequence.png" alt={t.sampleSequenceTitle} style={{ maxWidth: '100%', height: 'auto', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                        </div>
                        <div style={{ padding: '24px' }}>
                            <h4 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Workflow size={20} color="#4caf50" /> {t.sampleSequenceTitle}
                            </h4>
                            <p style={{ color: '#666', lineHeight: 1.6, fontSize: '15px' }}>
                                {t.sampleSequenceDesc}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Usage Section */}
            <section style={{ padding: '80px 24px', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px' }}>{t.howToTitle}</h2>
                    <p style={{ color: '#666' }}>{t.howToSubtitle}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    {[
                        {
                            step: '01',
                            title: t.step1,
                            desc: t.step1Desc,
                            icon: <Layers size={24} />
                        },
                        {
                            step: '02',
                            title: t.step2,
                            desc: t.step2Desc,
                            icon: <Cpu size={24} />
                        },
                        {
                            step: '03',
                            title: t.step3,
                            desc: t.step3Desc,
                            icon: <Workflow size={24} />
                        }
                    ].map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                            <div style={{
                                fontSize: '48px',
                                fontWeight: 900,
                                color: '#f0f0f0',
                                lineHeight: 1,
                                minWidth: '80px'
                            }}>
                                {item.step}
                            </div>
                            <div style={{
                                flex: 1,
                                padding: '24px',
                                background: '#fff',
                                borderRadius: '16px',
                                border: '1px solid #f0f0f0',
                                display: 'flex',
                                gap: '20px'
                            }}>
                                <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '12px', color: '#1a192b' }}>
                                    {item.icon}
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>{item.title}</h4>
                                    <p style={{ color: '#666', lineHeight: 1.6 }}>{item.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: '100px 24px', textAlign: 'center' }}>
                <div style={{
                    maxWidth: '900px',
                    margin: '0 auto',
                    padding: '80px 40px',
                    background: 'linear-gradient(135deg, #1a192b 0%, #3a394b 100%)',
                    borderRadius: '40px',
                    color: '#fff',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ fontSize: '40px', fontWeight: 800, marginBottom: '24px' }}>{t.ctaTitle}</h2>
                    <p style={{ fontSize: '18px', opacity: 0.8, marginBottom: '40px' }}>
                        {t.ctaDesc}
                    </p>
                    <Link href="/modeler" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '20px 48px',
                        background: '#fff',
                        color: '#1a192b',
                        borderRadius: '16px',
                        fontSize: '18px',
                        fontWeight: 800,
                        textDecoration: 'none',
                        transition: 'transform 0.2s'
                    }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                        {t.ctaButton} <ChevronRight size={24} />
                    </Link>
                </div>
            </section>

            <footer style={{ padding: '40px 24px', textAlign: 'center', borderTop: '1px solid #f0f0f0', color: '#999', fontSize: '13px' }}>
                <div style={{ marginBottom: '8px' }}>&copy; 2026 ktar. All rights reserved.</div>
                <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '4px' }}>v2.2.21-BETA (rev-ef3b0ca)</div>
                <div style={{ fontSize: '12px', fontStyle: 'italic', opacity: 0.8 }}>Taking modeling to new heights with Antigravity</div>
            </footer>
        </div>
    );
}
