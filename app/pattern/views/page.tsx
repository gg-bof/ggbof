'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { Compass } from 'lucide-react';
import { ViewLayout } from '@/components/ViewLayout';

// MDXコンテンツマップ（ビルド時に解決される）
import * as ActivityConnectionJa from '@/content/views/activity-connection.ja.mdx';
import * as ActivityConnectionEn from '@/content/views/activity-connection.en.mdx';
import * as InnovationTimingJa from '@/content/views/innovation-timing.ja.mdx';
import * as InnovationTimingEn from '@/content/views/innovation-timing.en.mdx';
import * as RoleShiftJa from '@/content/views/role-shift.ja.mdx';
import * as RoleShiftEn from '@/content/views/role-shift.en.mdx';

const contentMap: any = {
    'activity-connection': { ja: ActivityConnectionJa, en: ActivityConnectionEn },
    'innovation-timing': { ja: InnovationTimingJa, en: InnovationTimingEn },
    'role-shift': { ja: RoleShiftJa, en: RoleShiftEn },
};

const viewpointIds = ['activity-connection', 'innovation-timing', 'role-shift'];

export default function ViewsPage() {
    const { lang } = useLanguage();
    const [expanded, setExpanded] = React.useState<string | null>(null);

    return (
        <div style={{ minHeight: '100vh', background: '#f8faff', padding: '100px 24px 80px' }}>
            <style>{`
                @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
                .vp-card { animation: fadeUp 0.35s ease both; transition: box-shadow 0.2s ease; }
                .vp-card:hover { box-shadow: 0 8px 28px -6px rgba(0,0,0,0.12) !important; }
                .chip-link:hover { background: #e0e7ff !important; color: #3730a3 !important; }
                .expand-btn:hover { background: #f8fafc !important; }
                .mdx-body h2 { font-size:13px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.06em; margin:20px 0 10px; padding-bottom:6px; border-bottom:1px solid #f1f5f9; }
                .mdx-body h3 { font-size:14px; font-weight:700; color:#1a192b; margin:12px 0 4px; }
                .mdx-body p { font-size:13px; color:#475569; line-height:1.8; margin:0 0 10px; }
                .mdx-body ul { font-size:13px; color:#475569; line-height:1.8; padding-left:20px; margin:0 0 10px; }
                .mdx-body li { margin-bottom:4px; }
                .mdx-body strong { color:#1a192b; font-weight:700; }
            `}</style>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ width: '34px', height: '34px', background: '#1a192b', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Compass size={16} color="#fff" />
                        </div>
                        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: '#1a192b', letterSpacing: '-0.02em' }}>
                            {lang === 'ja' ? '観点' : 'Views'}
                        </h1>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                        {lang === 'ja'
                            ? '活動の問題をAbCの視点で診断し、解決パターンを示します。'
                            : 'Diagnose activity problems from the AbC perspective and show resolution patterns.'}
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {viewpointIds.map((id, i) => {
                        const mdxModule = contentMap[id]?.[lang];
                        if (!mdxModule) return null;

                        const MdxContent = mdxModule.default;
                        const metadata = mdxModule.frontmatter;

                        return (
                            <div key={id} style={{ animation: `fadeUp 0.35s ease both ${i * 0.07}s` }}>
                                <ViewLayout
                                    metadata={metadata}
                                    lang={lang as 'ja' | 'en'}
                                    isExpanded={expanded === id}
                                    onToggle={() => setExpanded(expanded === id ? null : id)}
                                >
                                    <MdxContent />
                                </ViewLayout>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <Link href="/catalog" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '7px',
                        padding: '12px 24px', background: '#1a192b', color: '#fff',
                        borderRadius: '10px', textDecoration: 'none',
                        fontSize: '14px', fontWeight: 700,
                        boxShadow: '0 4px 14px rgba(26,25,43,0.18)',
                    }}>
                        {lang === 'ja' ? 'カタログを見る' : 'Browse Catalog'}
                        <ArrowRight size={15} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
