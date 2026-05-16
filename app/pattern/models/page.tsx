'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { ArrowRight, BookOpen, Tag } from 'lucide-react';
import { patternCategories } from '@/app/patterns/data';

// アンチパターンを除いた全パターンをフラット化
const allPatterns = patternCategories
    .filter(c => c.id !== 'anti-patterns')
    .flatMap(cat => cat.patterns.map(p => ({ ...p, categoryId: cat.id, categoryTitle: cat.title })));

// 全タグを収集（重複除去）
const allTags = Array.from(new Set(allPatterns.flatMap(p => (p as any).tags ?? []))) as string[];

export default function CatalogPage() {
    const { lang } = useLanguage();
    const [activeTag, setActiveTag] = React.useState<string | null>(null);

    const filtered = activeTag
        ? allPatterns.filter(p => ((p as any).tags ?? []).includes(activeTag))
        : allPatterns;

    return (
        <div style={{ minHeight: '100vh', background: '#f8faff', padding: '100px 24px 80px' }}>
            <style>{`
                @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                .pattern-card { transition: all 0.25s ease; }
                .pattern-card:hover { transform: translateY(-2px); box-shadow: 0 12px 32px -8px rgba(0,0,0,0.12) !important; }
                .tag-chip { cursor: pointer; transition: all 0.15s ease; }
                .tag-chip:hover { border-color: #6366f1 !important; color: #4f46e5 !important; }
            `}</style>

            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <div style={{ width: '36px', height: '36px', background: '#1a192b', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <BookOpen size={18} color="#fff" />
                            </div>
                            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#1a192b', letterSpacing: '-0.02em' }}>
                                {lang === 'ja' ? 'カタログ' : 'Catalog'}
                            </h1>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
                            {lang === 'ja'
                                ? `${filtered.length} 件のパターン${activeTag ? ` — タグ: ${activeTag}` : ''}`
                                : `${filtered.length} patterns${activeTag ? ` — tag: ${activeTag}` : ''}`}
                        </p>
                    </div>
                    <Link href="/modeler" style={{
                        padding: '10px 22px', background: '#1a192b', color: '#fff',
                        borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 700,
                        whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(26,25,43,0.2)',
                    }}>
                        {lang === 'ja' ? 'モデラーを開く' : 'Open Modeler'}
                    </Link>
                </div>

                {/* Tag filter */}
                <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '8px',
                    marginBottom: '36px', padding: '16px',
                    background: '#fff', borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px -2px rgba(0,0,0,0.04)',
                }}>
                    <button
                        className="tag-chip"
                        onClick={() => setActiveTag(null)}
                        style={{
                            padding: '6px 14px', borderRadius: '99px', fontSize: '13px', fontWeight: 600,
                            border: `1px solid ${!activeTag ? '#1a192b' : '#e2e8f0'}`,
                            background: !activeTag ? '#1a192b' : '#fff',
                            color: !activeTag ? '#fff' : '#64748b',
                            display: 'flex', alignItems: 'center', gap: '5px',
                        }}
                    >
                        <Tag size={12} style={{ pointerEvents: 'none' }} />
                        {lang === 'ja' ? 'すべて' : 'All'}
                    </button>
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            className="tag-chip"
                            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                            style={{
                                padding: '6px 14px', borderRadius: '99px', fontSize: '13px', fontWeight: 600,
                                border: `1px solid ${activeTag === tag ? '#4f46e5' : '#e2e8f0'}`,
                                background: activeTag === tag ? '#ede9fe' : '#fff',
                                color: activeTag === tag ? '#4f46e5' : '#64748b',
                            }}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                {/* Pattern grid */}
                <div
                    key={activeTag ?? 'all'}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '20px',
                        animation: 'fadeIn 0.25s ease',
                    }}
                >
                    {filtered.map(pattern => (
                        <div
                            key={pattern.id}
                            id={pattern.id}
                            className="pattern-card"
                            style={{
                                background: '#fff', borderRadius: '16px',
                                border: '1px solid #eee', overflow: 'hidden',
                                display: 'flex', flexDirection: 'column',
                                boxShadow: '0 4px 8px -2px rgba(0,0,0,0.05)',
                            }}
                        >
                            <div style={{
                                height: '120px',
                                background: `linear-gradient(135deg, ${pattern.color}12, ${pattern.color}28)`,
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                            }}>
                                <pattern.icon size={52} color={pattern.color} style={{ opacity: 0.9 }} />
                            </div>
                            <div style={{ padding: '18px 20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 700, color: '#1a192b' }}>
                                    {pattern.name[lang as 'ja' | 'en']}
                                </h3>
                                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 14px 0', lineHeight: 1.7, flexGrow: 1 }}>
                                    {pattern.description[lang as 'ja' | 'en']}
                                </p>
                                {/* Tags */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                                    {((pattern as any).tags ?? []).map((tag: string) => (
                                        <button
                                            key={tag}
                                            onClick={() => setActiveTag(tag)}
                                            style={{
                                                padding: '3px 10px', borderRadius: '99px',
                                                fontSize: '11px', fontWeight: 600,
                                                background: '#f1f5f9', color: '#64748b',
                                                border: '1px solid #e2e8f0', cursor: 'pointer',
                                            }}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                                <Link href={`/patterns/${pattern.id}`} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    padding: '8px 14px', background: '#f1f5f9', color: '#0f172a',
                                    borderRadius: '8px', textDecoration: 'none',
                                    fontSize: '13px', fontWeight: 600,
                                }}>
                                    {lang === 'ja' ? '詳細を見る' : 'View Details'}
                                    <ArrowRight size={13} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
