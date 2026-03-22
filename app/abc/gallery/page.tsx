'use client';

import React, { useState, useEffect } from 'react';
import { Layers, ArrowLeft, ArrowUpRight, Lock, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useLanguage } from '@/components/LanguageContext';
import { translations } from '../translations';
import ReactFlow, { Background, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { nodeTypes } from '../components/NodeTypes';

export default function GalleryPage() {
    const { user, isLoaded } = useUser();
    const { lang } = useLanguage();
    const t = (translations as any)[lang];

    const [components, setComponents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const rawRole = user?.publicMetadata?.role;
    const roles = Array.isArray(rawRole) ? rawRole : [rawRole || 'guest'];
    const isOperational = roles.includes('admin') || roles.includes('staff');
    const isMember = roles.includes('member') || roles.includes('paid');

    useEffect(() => {
        fetch('/api/components')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setComponents(data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const canUseComp = (comp: any) => {
        if (comp.type === 'free') return true;
        if (comp.isPrivate) return isOperational;
        return isOperational || isMember;
    };

    return (
        <ReactFlowProvider>
            <div style={{ minHeight: '100vh', background: '#f8faff', padding: '40px 20px' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <Link href="/abc" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '14px', textDecoration: 'none', marginBottom: '12px' }}>
                                <ArrowLeft size={16} /> {lang === 'ja' ? 'ABC TOPへ戻る' : 'Back to ABC TOP'}
                            </Link>
                            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1a192b', margin: 0 }}>
                                {lang === 'ja' ? 'コンポーネント・ギャラリー' : 'Component Gallery'}
                            </h1>
                            <p style={{ color: '#666', marginTop: '8px' }}>
                                {lang === 'ja' ? 'ABC手法で作成された再利用可能なモデル一覧' : 'A collection of reusable models built with the ABC methodology'}
                            </p>
                        </div>
                        <Link href="/abc/modeler" style={{
                            padding: '12px 24px',
                            background: '#1a192b',
                            color: '#fff',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 12px rgba(26, 25, 43, 0.2)'
                        }}>
                            {t.openModeler}
                        </Link>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '100px', color: '#666' }}>
                            <div style={{ fontSize: '18px' }}>{lang === 'ja' ? '読み込み中...' : 'Loading...'}</div>
                        </div>
                    ) : components.length === 0 ? (
                        <div style={{ background: '#fff', borderRadius: '16px', padding: '80px', textAlign: 'center', border: '1px solid #eee' }}>
                            <Layers size={64} style={{ opacity: 0.1, marginBottom: '20px' }} />
                            <div style={{ color: '#999' }}>{lang === 'ja' ? '公開中のコンポーネントはまだありません。' : 'No public components yet.'}</div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                            {components.map(comp => {
                                const allowed = canUseComp(comp);
                                if (comp.isPrivate && !isOperational) return null;

                                return (
                                    <div key={comp.id} style={{
                                        background: '#fff',
                                        borderRadius: '16px',
                                        border: '1px solid #eee',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                                    }}>
                                        <div style={{ height: '180px', background: '#f0f3f7', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                                            {comp.thumbnail ? (
                                                <img src={comp.thumbnail} alt={comp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (comp.data?.nodes && comp.data?.nodes?.length > 0) ? (
                                                <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
                                                    <ReactFlow
                                                        nodes={comp.data.nodes}
                                                        edges={comp.data.edges || []}
                                                        nodeTypes={nodeTypes}
                                                        fitView
                                                        nodesDraggable={false}
                                                        nodesConnectable={false}
                                                        elementsSelectable={false}
                                                        panOnDrag={false}
                                                        zoomOnScroll={false}
                                                        zoomOnPinch={false}
                                                        zoomOnDoubleClick={false}
                                                        style={{ width: '100%', height: '100%' }}
                                                    >
                                                        <Background gap={12} size={1} />
                                                    </ReactFlow>
                                                </div>
                                            ) : (
                                                <Layers size={48} style={{ opacity: 0.2 }} />
                                            )}
                                            {!allowed && (
                                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
                                                    <Lock size={32} color="#fff" />
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1a192b' }}>{comp.name}</h3>
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    <span style={{
                                                        fontSize: '10px',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        background: comp.type === 'free' ? '#e8f5e9' : '#fff3e0',
                                                        color: comp.type === 'free' ? '#2e7d32' : '#e65100',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {comp.type === 'free' ? 'FREE' : 'PREMIUM'}
                                                    </span>
                                                </div>
                                            </div>
                                            <p style={{ color: '#666', fontSize: '14px', margin: '0 0 20px 0', minHeight: '40px' }}>
                                                {comp.description || (lang === 'ja' ? 'ABC手法に基づいた再利用可能なコンポーネント' : 'Reusable component based on ABC methodology')}
                                            </p>

                                            <div style={{ marginTop: 'auto' }}>
                                                {allowed ? (
                                                    <Link href={`/abc/modeler?template=${comp.id}`} style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px',
                                                        width: '100%',
                                                        padding: '10px',
                                                        background: '#4f46e5',
                                                        color: '#fff',
                                                        borderRadius: '8px',
                                                        textDecoration: 'none',
                                                        fontSize: '14px',
                                                        fontWeight: '600'
                                                    }}>
                                                        {lang === 'ja' ? 'モデラーで開く' : 'Open in Modeler'} <ArrowUpRight size={16} />
                                                    </Link>
                                                ) : (
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px',
                                                        width: '100%',
                                                        padding: '10px',
                                                        background: '#f1f5f9',
                                                        color: '#64748b',
                                                        borderRadius: '8px',
                                                        fontSize: '14px'
                                                    }}>
                                                        {lang === 'ja' ? '会員限定' : 'Members Only'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </ReactFlowProvider>
    );
}
