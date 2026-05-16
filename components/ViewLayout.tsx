'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';

export type ViewMetadata = {
    theme: string;
    painPoint: string;
    relatedPatterns: string[];
    color: string;
    tag?: string;
};

const patternNames: Record<string, { ja: string; en: string }> = {
    'horizontal-contract': { ja: '契約パターン', en: 'Contract Pattern' },
    'context-pattern': { ja: '文脈パターン', en: 'Context Pattern' },
    'improvement-pattern': { ja: '改善パターン', en: 'Improvement Pattern' },
    'sequence': { ja: 'シーケンス', en: 'Sequence' },
    'synchronization': { ja: '同期', en: 'Synchronization' },
    'feedback-loop': { ja: 'フィードバックループ', en: 'Feedback Loop' },
    'executor-type': { ja: '遂行型', en: 'Executor Type' },
    'conception-type': { ja: '構想型', en: 'Conception Type' },
};

interface ViewLayoutProps {
    metadata: ViewMetadata;
    lang: 'ja' | 'en';
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

export const ViewLayout: React.FC<ViewLayoutProps> = ({
    metadata,
    lang,
    isExpanded,
    onToggle,
    children,
}) => {
    return (
        <div
            className="vp-card"
            style={{
                background: '#fff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 2px 8px -2px rgba(0,0,0,0.05)',
                marginBottom: '12px',
            }}
        >
            {/* Header row */}
            <div style={{ display: 'flex', borderLeft: `4px solid ${metadata.color}` }}>
                <div style={{ flex: 1, padding: '16px 20px', minWidth: 0 }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: metadata.color, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                        {metadata.tag || (lang === 'ja' ? '観点' : 'VIEW')}
                    </span>
                    <h2 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 700, color: '#1a192b', borderBottom: 'none', padding: 0 }}>
                        {metadata.theme}
                    </h2>
                    {/* Pain point */}
                    <div style={{ background: '#fafafa', border: '1px solid #f1f5f9', borderRadius: '8px', padding: '10px 14px 10px 22px', position: 'relative' }}>
                        <span style={{ position: 'absolute', top: '6px', left: '8px', fontSize: '22px', color: '#cbd5e1', lineHeight: 1, fontFamily: 'Georgia, serif' }}>"</span>
                        <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.7, fontStyle: 'italic' }}>
                            {metadata.painPoint}
                        </p>
                    </div>
                </div>

                {/* Expand button */}
                <button
                    className="expand-btn"
                    onClick={onToggle}
                    style={{
                        padding: '0 20px', alignSelf: 'stretch',
                        background: 'none', border: 'none',
                        borderLeft: '1px solid #f1f5f9',
                        cursor: 'pointer', color: '#94a3b8',
                        display: 'flex', alignItems: 'center',
                        transition: 'background 0.15s',
                    }}
                    aria-label={isExpanded ? 'collapse' : 'expand'}
                >
                    <ChevronDown size={18} style={{ transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>
            </div>

            {/* Expanded: Content + related patterns */}
            {isExpanded && (
                <div style={{ borderTop: '1px solid #f1f5f9', padding: '20px 24px' }}>
                    <div className="mdx-body">
                        {children}
                    </div>

                    {/* Related patterns */}
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f8fafc' }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>
                            {lang === 'ja' ? '関連パターン' : 'Related Patterns'}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {metadata.relatedPatterns.map(pid => (
                                <Link
                                    key={pid}
                                    href={`/catalog#${pid}`}
                                    className="chip-link"
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                        padding: '5px 12px',
                                        background: '#f1f5f9', color: '#475569',
                                        borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                                        textDecoration: 'none', border: '1px solid #e2e8f0',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    {patternNames[pid]?.[lang] ?? pid}
                                    <ArrowRight size={11} />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
