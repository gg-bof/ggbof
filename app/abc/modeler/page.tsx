'use client';



import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  Panel,
  Handle,
  Position,
  NodeProps,
  NodeResizer,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  HelpCircle, Upload, Download, X, Maximize2, Minimize2,
  Trash2, Plus, GripVertical, Settings,
  Save, FileJson, ChevronRight, ChevronLeft,
  Search, Lock, Layers, MoreVertical, ArrowUpRight,
  BookOpen, Zap, ChevronDown, Share2, FileDown,
  Unlock, Languages, Circle, Square, Triangle, Hexagon,
  Database, Activity, FileText, User, Users, Briefcase,
  Play, CheckCircle, Info, Shield, Key, Heart, MessageSquare
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useLanguage } from '@/components/LanguageContext';
import { translations } from '../translations';

import { 
  nodeTypes, NodeIcon, NODE_WIDTH, NODE_HEIGHT, NODE_ICONS,
  NodeIconType
} from '../components/NodeTypes';

// --- Constants ---

const COMPONENTS = [
  {
    id: 'basic',
    name: '基本フロー',
    type: 'free',
    isPrivate: false,
    thumbnail: '/thumbnails/basic.png',
    nodes: [
      { id: 't1_art1', type: 'artifact', position: { x: 50, y: 100 }, data: { label: '入力書類' }, width: NODE_WIDTH, height: NODE_HEIGHT, style: { width: NODE_WIDTH, height: NODE_HEIGHT } },
      { id: 't1_act1', type: 'activity', position: { x: 300, y: 100 }, data: { label: '処理プロセス', inputs: 1, outputs: 1, handleData: { 'in-0': { name: '要件', description: '入力の妥当性' }, 'out-0': { name: '成果物', description: '処理済みのデータ' } } }, width: NODE_WIDTH, height: NODE_HEIGHT, style: { width: NODE_WIDTH, height: NODE_HEIGHT } },
      { id: 't1_art2', type: 'artifact', position: { x: 550, y: 100 }, data: { label: '出力成果物' }, width: NODE_WIDTH, height: NODE_HEIGHT, style: { width: NODE_WIDTH, height: NODE_HEIGHT } },
    ],
    edges: [
      { id: 'e1-1', source: 't1_art1', target: 't1_act1', targetHandle: 'in-0', animated: true, style: { stroke: '#1a192b', strokeWidth: 2 } },
      { id: 'e1-2', source: 't1_act1', sourceHandle: 'out-0', target: 't1_art2', animated: true, style: { stroke: '#1a192b', strokeWidth: 2 } },
    ]
  },
  {
    id: 'feedback',
    name: '承認・フィードバック',
    type: 'free',
    isPrivate: false,
    thumbnail: '/thumbnails/feedback.png',
    nodes: [
      { id: 't2_art1', type: 'artifact', position: { x: 50, y: 150 }, data: { label: '課題' }, width: NODE_WIDTH, height: NODE_HEIGHT, style: { width: NODE_WIDTH, height: NODE_HEIGHT } },
      { id: 't2_act1', type: 'activity', position: { x: 300, y: 150 }, data: { label: '審査', inputs: 1, outputs: 2, handleData: { 'in-0': { name: '申請', description: '審査対象' }, 'out-0': { name: '承認', description: '合格' }, 'out-1': { name: '差し戻し', description: '不備あり' } } }, width: NODE_WIDTH, height: NODE_HEIGHT, style: { width: NODE_WIDTH, height: NODE_HEIGHT } },
      { id: 't2_art_ok', type: 'artifact', position: { x: 550, y: 50 }, data: { label: '承認済書類' }, width: NODE_WIDTH, height: NODE_HEIGHT, style: { width: NODE_WIDTH, height: NODE_HEIGHT } },
      { id: 't2_art_ng', type: 'artifact', position: { x: 550, y: 250 }, data: { label: '修正依頼' }, width: NODE_WIDTH, height: NODE_HEIGHT, style: { width: NODE_WIDTH, height: NODE_HEIGHT } },
    ],
    edges: [
      { id: 'e2-1', source: 't2_art1', target: 't2_act1', targetHandle: 'in-0', animated: true, style: { stroke: '#1a192b', strokeWidth: 2 } },
      { id: 'e2-2', source: 't2_act1', sourceHandle: 'out-0', target: 't2_art_ok', animated: true, style: { stroke: '#1a192b', strokeWidth: 2 } },
      { id: 'e2-3', source: 't2_act1', sourceHandle: 'out-1', target: 't2_art_ng', animated: true, style: { stroke: '#1a192b', strokeWidth: 2 } },
    ]
  },
  {
    id: 'contract',
    name: '契約締結プロセス',
    type: 'paid',
    isPrivate: false,
    thumbnail: '/thumbnails/contract.png',
    nodes: [
      { id: 'p1_art1', type: 'artifact', position: { x: 50, y: 150 }, data: { label: '契約依頼' }, width: NODE_WIDTH, height: NODE_HEIGHT, style: { width: NODE_WIDTH, height: NODE_HEIGHT } },
      { id: 'p1_act1', type: 'activity', position: { x: 300, y: 150 }, data: { label: '契約審査', inputs: 1, outputs: 2, handleData: { 'in-0': { name: '依頼', description: '契約原案' }, 'out-0': { name: '承認', description: 'リーガルチェック済' }, 'out-1': { name: '修正要求', description: '文言修正' } } }, width: NODE_WIDTH, height: NODE_HEIGHT, style: { width: NODE_WIDTH, height: NODE_HEIGHT } },
      { id: 'p1_art2', type: 'artifact', position: { x: 550, y: 50 }, data: { label: '締結可能契約' }, width: NODE_WIDTH, height: NODE_HEIGHT, style: { width: NODE_WIDTH, height: NODE_HEIGHT } },
      { id: 'p1_art3', type: 'artifact', position: { x: 550, y: 250 }, data: { label: '再編集依頼' }, width: NODE_WIDTH, height: NODE_HEIGHT, style: { width: NODE_WIDTH, height: NODE_HEIGHT } },
    ],
    edges: [
      { id: 'pe1-1', source: 'p1_art1', target: 'p1_act1', targetHandle: 'in-0', animated: true, style: { stroke: '#1a192b', strokeWidth: 2 } },
      { id: 'pe1-2', source: 'p1_act1', sourceHandle: 'out-0', target: 'p1_art2', animated: true, style: { stroke: '#1a192b', strokeWidth: 2 } },
      { id: 'pe1-3', source: 'p1_act1', sourceHandle: 'out-1', target: 'p1_art3', animated: true, style: { stroke: '#1a192b', strokeWidth: 2 } },
    ]
  },
  {
    id: 'staff-only',
    name: '内部資料ドラフト',
    type: 'paid',
    isPrivate: true,
    thumbnail: '/thumbnails/private.png',
    nodes: [
      { id: 's1_art1', type: 'artifact', position: { x: 0, y: 0 }, data: { label: '機密情報' }, width: NODE_WIDTH, height: NODE_HEIGHT, style: { width: NODE_WIDTH, height: NODE_HEIGHT } },
    ],
    edges: []
  },
];

const getCompData = (comp: any) => {
  let nodes = [];
  let edges = [];
  
  if (comp.data) {
    nodes = comp.data.nodes || [];
    edges = comp.data.edges || [];
  } else if (comp.nodes) {
    nodes = comp.nodes || [];
    edges = comp.edges || [];
  }
  
  // Normalize nodes: Ensure top-level width/height handles
  const normalizedNodes = nodes.map((n: any) => {
    const w = n.width || n.style?.width || NODE_WIDTH;
    const h = n.height || n.style?.height || NODE_HEIGHT;
    const parseSize = (val: any) => {
       if (typeof val === 'number') return val;
       if (typeof val === 'string') return parseInt(val.replace('px', '')) || 150;
       return 150;
    };
    const finalW = parseSize(w);
    const finalH = parseSize(h);
    return {
      ...n,
      width: finalW,
      height: finalH,
      style: { ...(n.style || {}), width: finalW, height: finalH },
      draggable: true, 
      selectable: true,
      zIndex: n.type === 'context' ? 0 : 100
    };
  });
  
  // Return deep copies to avoid reference mutations
  return { 
    nodes: JSON.parse(JSON.stringify(normalizedNodes)), 
    edges: JSON.parse(JSON.stringify(edges)) 
  };
};

const ComponentThumbnail = ({ comp, nodeTypes }: { comp: any, nodeTypes: any }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  if (comp.thumbnail) {
    return (
      <img
        src={comp.thumbnail}
        alt={comp.name}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
  }

  const { nodes, edges } = getCompData(comp);

  if (nodes.length > 0) {
    return (
      <div ref={ref} style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
        {isVisible ? (
          <ReactFlow
            nodes={nodes.map((n: any) => ({ ...n, selectable: false, draggable: false }))}
            edges={edges.map((e: any) => ({ ...e, selectable: false, animated: false }))}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
            panOnDrag={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
          >
            <Background variant={'dots' as any} gap={10} size={1} color="#f0f0f0" />
          </ReactFlow>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8f9fa' }}>
             <Layers size={40} color="#eee" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ccc' }}>
      <Layers size={40} />
    </div>
  );
};

const LibrarySidebarItem = ({ comp, onClick }: { comp: any, onClick: () => void }) => {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '8px',
        border: '1px solid #eee',
        borderRadius: '8px',
        marginBottom: '8px',
        cursor: 'pointer',
        background: '#fff',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}
      onMouseEnter={(e) => { 
        e.currentTarget.style.borderColor = '#4f46e5'; 
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'; 
      }}
      onMouseLeave={(e) => { 
        e.currentTarget.style.borderColor = '#eee'; 
        e.currentTarget.style.boxShadow = 'none'; 
      }}
    >
      <div style={{ 
        width: '44px', 
        height: '44px', 
        borderRadius: '6px', 
        overflow: 'hidden', 
        background: '#f8f9fa', 
        flexShrink: 0,
        border: '1px solid #f0f0f0'
      }}>
        {comp.thumbnail ? (
          <img src={comp.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#eee' }}>
            <Layers size={20} />
          </div>
        )}
      </div>
      <div style={{ 
        fontSize: '11px', 
        fontWeight: '700', 
        color: '#1a192b', 
        overflow: 'hidden', 
        textOverflow: 'ellipsis', 
        whiteSpace: 'nowrap',
        flex: 1
      }}>
        {comp.name}
      </div>
    </div>
  );
};

const ComponentModal = ({
  isOpen,
  onClose,
  onSelect,
  roles,
  isOperational,
  isMember,
  lang,
  nodes,
  onEditComp,
  dbComponents,
  loading,
  onDeleteComp,
  showConfirm,
  onLoadFullData
}: {
  isOpen: boolean,
  onClose: () => void,
  onSelect: (template: any) => void,
  roles: string[],
  isOperational: boolean,
  isMember: boolean,
  lang: 'ja' | 'en',
  nodes: any[],
  onEditComp: (comp: any) => void,
  dbComponents: any[],
  loading: boolean,
  onDeleteComp: (id: string) => void,
  showConfirm: (title: string, message: string, onConfirm: () => void) => void,
  onLoadFullData: (id: string) => Promise<any>
}) => {
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);
  const t = (translations as any)[lang];

  // Close context menu when clicking outside
  React.useEffect(() => {
    const handleClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const onSelectMode = async (comp: any, mode: 'load' | 'import') => {
    // If component doesn't have nodes/edges (fetched metadataOnly), fetch full data
    let fullComp = comp;
    if (!comp.data && !comp.nodes) {
      const data = await onLoadFullData(comp.id);
      if (data) {
        fullComp = { ...comp, data };
      }
    }

    if (fullComp && (fullComp.nodes || fullComp.data?.nodes)) {
      console.log("[ABC] Selected Comp:", fullComp.id, "Nodes:", (fullComp.nodes || fullComp.data?.nodes)?.length, "Edges:", (fullComp.edges || fullComp.data?.edges)?.length);
    }

    if (mode === 'load' && nodes.length > 0) {
      showConfirm(
        t.libLoad,
        t.confirmOverwrite,
        () => onSelect({ ...fullComp, loadMode: mode })
      );
      return;
    }
    onSelect({ ...fullComp, loadMode: mode });
  };

  if (!isOpen) return null;

  const canUseComp = (comp: any) => {
    if (comp.id === 'basic' || comp.type === 'free') return true;
    if (comp.isPrivate) return isOperational;
    return isOperational || isMember;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1100,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        width: '98vw',
        height: '98vh',
        maxWidth: '98vw',
        maxHeight: '98vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#fcfcfc'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a192b' }}>{(translations as any)[lang].sidebarLibrary}</div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#999' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px', flex: 1, alignItems: 'start' }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#666' }}>
              {lang === 'ja' ? '読み込み中...' : 'Loading...'}
            </div>
          ) : (() => {
            const allComps = [
              ...COMPONENTS,
              ...dbComponents.filter((dc: any) => !COMPONENTS.some(sc => sc.id === dc.id))
            ];

            if (allComps.length === 0) {
              return (
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#666' }}>
                  {lang === 'ja' ? 'コンポーネントが見つかりません。' : 'No components found.'}
                </div>
              );
            }

            return allComps.map(comp => {
              const allowed = true; // Everyone can use library components, access is now at note-level
              if (comp.isPrivate && !isOperational) return null;

              return (
                <div
                  key={comp.id}
                  style={{
                    border: '1px solid #eee',
                    borderRadius: '12px',
                    transition: 'all 0.2s',
                    position: 'relative',
                    opacity: 1,
                    background: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
                  }}
                  onMouseEnter={(e) => {
                    if (allowed) {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (allowed) {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)';
                    }
                  }}
                >
                  <div style={{ height: '180px', background: '#f5f5f5', position: 'relative', overflow: 'hidden' }}>
                    <ComponentThumbnail comp={comp} nodeTypes={nodeTypes} />
                  </div>

                  {allowed && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === comp.id ? null : comp.id);
                        }}
                        style={{
                          border: 'none',
                          background: '#fff',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                          color: '#666'
                        }}
                      >
                        <MoreVertical size={18} />
                      </button>

                      {activeMenuId === comp.id && (
                        <div style={{
                          position: 'absolute',
                          top: '36px',
                          right: 0,
                          background: '#fff',
                          borderRadius: '8px',
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                          border: '1px solid #eee',
                          zIndex: 100,
                          minWidth: '120px',
                          padding: '4px'
                        }}>
                          <button
                            onClick={() => onSelectMode(comp, 'load')}
                            style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1a192b' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                          >
                            <Layers size={14} /> {t.libLoad}
                          </button>
                          <button
                            onClick={() => onSelectMode(comp, 'import')}
                            style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1a192b' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                          >
                            <Plus size={14} /> {t.libImport}
                          </button>
                          {isOperational && !COMPONENTS.some(sc => sc.id === comp.id) && (
                            <>
                              <div style={{ height: '1px', background: '#eee', margin: '4px 0' }} />
                              <button
                                onClick={() => onEditComp(comp)}
                                style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1a192b' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                              >
                                <Settings size={14} /> {t.libProperties}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showConfirm(
                                    t.libDelete,
                                    lang === 'ja' ? 'このコンポーネントを削除しますか？' : 'Are you sure you want to delete this component?',
                                    () => onDeleteComp(comp.id)
                                  );
                                }}
                                style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4d4f' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#fff1f0'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                              >
                                <Trash2 size={14} /> {t.libDelete}
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                      <div style={{ fontWeight: 'bold', color: '#1a192b', fontSize: '18px' }}>{comp.name}</div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {comp.type === 'premium' ? (
                          <div style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>PREMIUM</div>
                        ) : (
                          <div style={{ background: '#ecfdf5', color: '#059669', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>FREE</div>
                        )}
                      </div>
                    </div>
                    {comp.description ? (
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '16px', lineHeight: 1.5 }}>
                        {comp.description}
                      </div>
                    ) : (
                      <div style={{ height: '8px' }} />
                    )}

                    {/* Load/Import buttons removed - available in "..." menu */}
                  </div>
                </div>
              );
            })
          })()}
        </div>
        <div style={{ padding: '16px', borderTop: '1px solid #eee', textAlign: 'right', background: '#fcfcfc' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #eee', background: '#fff', cursor: 'pointer' }}>
            {lang === 'ja' ? '閉じる' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ComponentSaveModal = ({
  isOpen,
  onClose,
  onSave,
  lang,
  defaultName = '',
  existingComponents = [],
  initialData = null
}: {
  isOpen: boolean,
  onClose: () => void,
  onSave: (data: { name: string, description: string, isPrivate: boolean, id?: string, thumbnail?: string }) => void,
  lang: 'ja' | 'en',
  defaultName?: string,
  existingComponents?: any[],
  initialData?: { id: string, name: string, description: string, isPrivate: boolean, thumbnail?: string } | null
}) => {
  const [name, setName] = React.useState(defaultName);
  const [description, setDescription] = React.useState('');
  const [isPrivate, setIsPrivate] = React.useState(false);
  const [thumbnail, setThumbnail] = React.useState<string | undefined>(undefined);
  const t = (translations as any)[lang];

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setDescription(initialData.description || '');
        setIsPrivate(initialData.isPrivate || false);
        setThumbnail(initialData.thumbnail);
      } else {
        setName(defaultName);
        setDescription('');
        setIsPrivate(false);
        setThumbnail(undefined);
      }
    }
  }, [isOpen, defaultName, initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) {
      alert(lang === 'ja' ? '名前を入力してください' : 'Please enter a name');
      return;
    }

    const existing = existingComponents.find(c => c.name === name);
    if (existing) {
      if (!window.confirm(t.confirmOverwriteComponent)) {
        return;
      }
    }

    onSave({
      name,
      description,
      isPrivate,
      thumbnail,
      id: initialData ? initialData.id : existing?.id
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1200,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        width: '500px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
          {initialData ? (lang === 'ja' ? 'コンポーネント情報の編集' : 'Edit Component Details') : (lang === 'ja' ? 'ライブラリへの登録' : 'Register to Library')}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold' }}>{lang === 'ja' ? 'コンポーネント名' : 'Component Name'}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
            placeholder={lang === 'ja' ? '名前を入力...' : 'Enter name...'}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold' }}>{lang === 'ja' ? '説明' : 'Description'}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minHeight: '80px', fontFamily: 'inherit' }}
            placeholder={lang === 'ja' ? '詳しい説明を入力...' : 'Enter description...'}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold' }}>{t.propImage}</label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              background: '#f9f9f9'
            }}>
              {thumbnail ? (
                <img src={thumbnail} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Layers size={24} color="#ccc" />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ fontSize: '13px' }}
              />
              <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                {lang === 'ja' ? '※画像はBase64で保存されます' : '*Image will be stored as Base64'}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            id="isPrivate"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            style={{ width: '16px', height: '16px' }}
          />
          <label htmlFor="isPrivate" style={{ fontSize: '14px', cursor: 'pointer' }}>
            {lang === 'ja' ? 'プライベートとして登録' : 'Register as Private'}
          </label>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>
            {lang === 'ja' ? 'キャンセル' : 'Cancel'}
          </button>
          <button onClick={handleSave} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#1a192b', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
            {lang === 'ja' ? '保存' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Tooltip = ({ content, x, y, title = "Note" }: { content: string, x: number, y: number, title?: string }) => {
  if (!content) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: y + 20,
        left: x + 20,
        zIndex: 1000,
        background: 'rgba(255, 251, 230, 0.95)',
        color: '#1a192b',
        padding: '12px 16px',
        borderRadius: '12px',
        fontSize: '18px',
        lineHeight: '1.5',
        maxWidth: '400px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        pointerEvents: 'none',
        whiteSpace: 'pre-wrap',
        border: '1px solid rgba(255, 204, 0, 0.5)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', color: '#8c8c8c', fontWeight: 'bold' }}>{title}</div>
      {content}
    </div>
  );
};

// --- Main App Components ---

const Sidebar = ({
  onImport,
  onExport,
  onLoadTemplate,
  onDeleteSelected,
  onClearAll,
  onPartialImport,
  onPartialExport,
  showGuide,
  onToggleGuide,
  onSaveToLibrary,
  onOpenComponentModal,
  dbComponents,
  isOperational,
  isMember,
  lang,
  setLang,
  t
}: {
  onImport: () => void,
  onExport: () => void,
  onLoadTemplate: (t: any) => void,
  onDeleteSelected: () => void,
  onClearAll: () => void,
  onPartialImport: () => void,
  onPartialExport: () => void,
  showGuide: boolean,
  onToggleGuide: () => void,
  onSaveToLibrary: (name: string) => void,
  onOpenComponentModal: () => void,
  dbComponents: any[],
  isOperational: boolean,
  isMember: boolean,
  lang: 'ja' | 'en',
  setLang: (l: 'ja' | 'en') => void,
  t: any
}) => {
  const { user, isLoaded } = useUser();
  const rawRole = user?.publicMetadata?.role;
  const roles = Array.isArray(rawRole) ? rawRole : [rawRole || 'guest'];

  const isAdmin = roles.includes('admin');
  const isStaff = roles.includes('staff');
  // Using props for isMember and isOperational

  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const canUse = (lib: string) => {
    if (lib === 'Basic') return true; // すべての人
    if (lib === 'Premium' || lib === 'Member') return isOperational || isMember; // staff, member
    return false;
  };

  const handleLibraryClick = (lib: string, template: any) => {
    if (canUse(lib)) {
      onLoadTemplate(template);
    } else {
      alert(lang === 'ja'
        ? `このライブラリ（${lib}）のご利用には、会員登録またはアップグレードが必要です。`
        : `Access to this library (${lib}) requires membership or an upgrade.`
      );
    }
  };

  const libraryButtonStyle = (lib: string): React.CSSProperties => ({
    ...actionButtonStyle,
    background: canUse(lib) ? '#f8f9fa' : '#f0f0f0',
    border: '1px solid #eee',
    opacity: canUse(lib) ? 1 : 0.7,
    color: canUse(lib) ? '#1a192b' : '#888'
  });

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const sidebarSectionStyle: React.CSSProperties = {
    marginBottom: '30px',
  };

  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#8c8c8c',
    letterSpacing: '0.05em',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const nodeItemStyle: React.CSSProperties = {
    padding: '12px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    marginBottom: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'grab',
    background: '#fff',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s',
    userSelect: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  };

  const actionButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    marginBottom: '8px',
    border: '1px solid #e0e0e0',
    background: '#fff',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.2s',
    color: '#1a192b'
  };



  const langToggleStyle: React.CSSProperties = {
    background: '#f8f9fa',
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '4px',
    display: 'flex',
    gap: '4px',
    marginBottom: '20px'
  };

  const langButtonStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '6px 0',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none',
    background: active ? '#1a192b' : 'transparent',
    color: active ? '#fff' : '#666',
    transition: 'all 0.2s'
  });

  return (
    <aside style={{
      width: '240px',
      borderRight: '1px solid #eee',
      padding: '24px 16px',
      background: '#fcfcfc',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      height: '100%'
    }}>
      <div style={{
        fontSize: '18px',
        fontWeight: '800',
        color: '#1a192b',
        marginBottom: '24px',
        paddingBottom: '12px',
        borderBottom: '2px solid #1a192b',
        letterSpacing: '-0.02em'
      }}>
        Activity by Contract
      </div>

      {/* Language Toggle */}
      <div style={langToggleStyle}>
        <button style={langButtonStyle(lang === 'ja')} onClick={() => setLang('ja')}>日本語</button>
        <button style={langButtonStyle(lang === 'en')} onClick={() => setLang('en')}>English</button>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
        <button
          style={{
            ...actionButtonStyle,
            background: showGuide ? '#1a192b' : '#fff',
            color: showGuide ? '#fff' : '#1a192b',
            borderColor: '#1a192b',
            justifyContent: 'center',
            fontWeight: 'bold',
            flex: 1,
            height: '44px',
            marginBottom: 0
          }}
          onClick={onToggleGuide}
          title={t.guideTitle}
        >
          <HelpCircle size={20} />
        </button>

        <button
          style={{
            ...actionButtonStyle,
            background: '#fff',
            color: '#1a192b',
            borderColor: '#e0e0e0',
            justifyContent: 'center',
            fontWeight: 'bold',
            flex: 1,
            height: '44px',
            marginBottom: 0,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
          onClick={onOpenComponentModal}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1a192b'; e.currentTarget.style.background = '#fcfcfc'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.background = '#fff'; }}
          title={t.sidebarLibrary}
        >
          <BookOpen size={20} />
        </button>
      </div>

      <div style={sidebarSectionStyle}>
        <div style={sectionHeaderStyle}><Layers size={14} /> {t.sidebarNodes}</div>

        <div
          style={nodeItemStyle}
          onDragStart={(event) => onDragStart(event, 'activity')}
          draggable
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#ff4d4f'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#e0e0e0'; }}
        >
          <div style={{
            width: '64px',
            height: '44px',
            background: '#fff',
            border: '2.5px solid #1a192b',
            borderRadius: '8px',
            position: 'relative',
            marginBottom: '8px'
          }}>
            {/* Input (Left) */}
            <div style={{
              position: 'absolute',
              left: '-6px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '10px',
              height: '10px',
              background: '#2196f3',
              clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)'
            }} />
            {/* Output (Right) */}
            <div style={{
              position: 'absolute',
              right: '-6px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '10px',
              height: '10px',
              background: '#ff4d4f',
              clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)'
            }} />
            {/* Constraint (Top) */}
            <div style={{
              position: 'absolute',
              top: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '10px',
              height: '10px',
              background: '#4caf50',
              clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)'
            }} />
            {/* Asset (Bottom) */}
            <div style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '10px',
              height: '10px',
              background: '#ff9800',
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
            }} />
          </div>
          {t.nodeActivity}
        </div>

        <div
          style={nodeItemStyle}
          onDragStart={(event) => onDragStart(event, 'artifact')}
          draggable
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#2196f3'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#e0e0e0'; }}
        >
          <div style={{
            width: '64px',
            height: '44px',
            background: '#fff',
            border: '2.5px solid #2196f3',
            clipPath: 'polygon(15% 0%, 85% 0%, 100% 20%, 100% 80%, 85% 100%, 15% 100%, 0% 80%, 0% 20%)',
            marginBottom: '8px'
          }} />
          {t.nodeArtifact}
        </div>

        <div
          style={nodeItemStyle}
          onDragStart={(event) => onDragStart(event, 'context')}
          draggable
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#03a9f4'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#e0e0e0'; }}
        >
          <div style={{
            width: '64px',
            height: '44px',
            background: '#fff',
            border: '2.5px dashed #03a9f4',
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
            marginBottom: '8px'
          }} />
          {t.nodeContext}
        </div>

        <div
          style={nodeItemStyle}
          onDragStart={(event) => onDragStart(event, 'gate')}
          draggable
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#1a192b'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#e0e0e0'; }}
        >
          <div style={{
            width: '44px',
            height: '44px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <svg width="40" height="40">
              <polygon
                points="20,2 38,20 20,38 2,20"
                fill="#fff"
                stroke="#1a192b"
                strokeWidth="2.5"
              />
            </svg>
          </div>
          {t.nodeGate}
        </div>

        <div
          style={nodeItemStyle}
          onDragStart={(event) => onDragStart(event, 'comment')}
          draggable
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#9c27b0'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#e0e0e0'; }}
        >
          <div style={{
            width: '64px',
            height: '44px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '8px',
            background: 'rgba(156, 39, 176, 0.05)',
            border: '2px dashed #9c27b0',
            borderRadius: '4px',
            color: '#9c27b0'
          }}>
            <MessageSquare size={20} />
          </div>
          {t.nodeComment}
        </div>
      </div>


      <div style={sidebarSectionStyle}>
        <div
          style={{ ...sectionHeaderStyle, cursor: 'pointer', justifyContent: 'space-between' }}
          onClick={() => setIsActionsOpen(!isActionsOpen)}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#1a192b'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#8c8c8c'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={14} /> {t.sidebarActions}
          </div>
          {isActionsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>

        {isActionsOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
            {isOperational && (
              <>
                <button
                  style={{ ...actionButtonStyle, background: '#1a192b', color: '#fff' }}
                  onClick={() => onSaveToLibrary(lang === 'ja' ? '新規テンプレート' : 'New Template')}
                >
                  <Save size={16} /> {t.sidebarSaveToLib}
                </button>
                <div style={{ margin: '4px 0', borderTop: '1px solid #eee' }} />
              </>
            )}
            <button style={actionButtonStyle} onClick={onImport} title={t.sidebarImport}><Upload size={16} /> {t.sidebarImport}</button>
            <button style={actionButtonStyle} onClick={onPartialImport} title={t.sidebarPartialImport}><Share2 size={16} /> {t.sidebarPartialImport}</button>
            <div style={{ margin: '8px 0', borderTop: '1px solid #eee' }} />
            <button style={actionButtonStyle} onClick={onExport} title={t.sidebarExport}><Download size={16} /> {t.sidebarExport}</button>
            <button style={actionButtonStyle} onClick={onPartialExport} title={t.sidebarPartialExport}><FileDown size={16} /> {t.sidebarPartialExport}</button>
            <div style={{ margin: '8px 0', borderTop: '1px solid #eee' }} />
            <button style={{ ...actionButtonStyle, color: '#ff4d4f' }} onClick={onDeleteSelected}><Trash2 size={16} /> {t.sidebarDeleteSelected}</button>
            <button style={{ ...actionButtonStyle, color: '#ff4d4f' }} onClick={onClearAll}>{t.sidebarClearAll}</button>
          </div>
        )}
      </div>

    </aside >
  );
};

// --- Tree View ---
const TreeItem = ({ node, nodes, selectedId, onSelect, level = 0 }: { node: Node, nodes: Node[], selectedId: string | null, onSelect: (id: string) => void, level?: number }) => {
  const children = nodes.filter(n => n.parentId === node.id);
  const isSelected = selectedId === node.id;

  return (
    <div style={{ marginLeft: `${level * 12}px` }}>
      <div
        onClick={() => onSelect(node.id)}
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: isSelected ? '#e0e7ff' : 'transparent',
          color: isSelected ? '#4f46e5' : '#1a192b',
          fontWeight: isSelected ? '600' : '400',
          marginBottom: '2px',
          transition: 'all 0.15s'
        }}
      >
        <span style={{ opacity: 0.5 }}>
          {node.type === 'context' ? '📁' : node.type === 'activity' ? '⚙️' : node.type === 'artifact' ? '📄' : '💠'}
        </span>
        {node.data.label}
      </div>
      {children.map(child => (
        <TreeItem key={child.id} node={child} nodes={nodes} selectedId={selectedId} onSelect={onSelect} level={level + 1} />
      ))}
    </div>
  );
};

const PropertiesPanel = ({ nodes, node, selectedEdge, onUpdate, onUpdateEdge, onDeleteEdge, onClose, t, lang, onSelectNode, isMember, isOperational }: { nodes: Node[], node: Node | null, selectedEdge: Edge | null, onUpdate: (id: string, data: any) => void, onUpdateEdge: (id: string, data: any) => void, onDeleteEdge: (id: string) => void, onClose: () => void, t: any, lang: 'ja' | 'en', onSelectNode: (id: string) => void, isMember: boolean, isOperational: boolean }) => {
  const [panelTab, setPanelTab] = useState<'hierarchy' | 'properties'>('hierarchy');
  const [activeTab, setActiveTab] = useState<'general' | 'inputs' | 'outputs' | 'constraints' | 'assets'>('general');

  // Auto-switch to properties when a node is selected
  useEffect(() => {
    if (node) {
      setPanelTab('properties');
    }
  }, [node?.id]);

  const rootNodes = nodes.filter(n => !n.parentId);

  const handleTabStyle = (tab: string): React.CSSProperties => ({
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    color: activeTab === tab ? '#1a192b' : '#999',
    borderBottom: activeTab === tab ? '2px solid #1a192b' : '2px solid transparent',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  });

  const handlePanelTabStyle = (tab: string): React.CSSProperties => ({
    padding: '12px 0',
    flex: 1,
    textAlign: 'center',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    color: panelTab === tab ? '#4f46e5' : '#999',
    borderBottom: panelTab === tab ? '2px solid #4f46e5' : '2px solid transparent',
    transition: 'all 0.2s',
    background: panelTab === tab ? '#f5f7ff' : 'transparent'
  });

  return (
    <aside style={{
      width: '320px',
      borderLeft: '1px solid #eee',
      padding: '0',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-2px 0 8px rgba(0,0,0,0.05)',
      zIndex: 10,
      height: '100%'
    }}>
      {/* Top Panel Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #eee', background: '#fff' }}>
        <div style={handlePanelTabStyle('hierarchy')} onClick={() => setPanelTab('hierarchy')}>
          {lang === 'ja' ? '階層' : 'Hierarchy'}
        </div>
        <div style={handlePanelTabStyle('properties')} onClick={() => setPanelTab('properties')}>
          {lang === 'ja' ? 'プロパティ' : 'Properties'}
        </div>
      </div>

      <div style={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {panelTab === 'hierarchy' ? (
          <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '15px', color: '#8c8c8c', letterSpacing: '0.05em' }}>
              {lang === 'ja' ? 'ノード階層' : 'NODE HIERARCHY'}
            </div>
            {rootNodes.map(rn => (
              <TreeItem key={rn.id} node={rn} nodes={nodes} selectedId={node?.id || null} onSelect={onSelectNode} />
            ))}
          </div>
        ) : (
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {selectedEdge ? (
              <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '15px', color: '#8c8c8c', letterSpacing: '0.05em' }}>
                  {t.propEdgeStyle || 'LINE STYLE'}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', color: '#888' }}>{t.propLabel || 'Label'}</label>
                  <input
                    type="text"
                    value={typeof selectedEdge.label === 'string' ? selectedEdge.label : ''}
                    onChange={(e) => onUpdateEdge(selectedEdge.id, { label: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', color: '#888' }}>{t.propColor || 'Color'}</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={selectedEdge.style?.stroke || '#1a192b'}
                      onChange={(e) => onUpdateEdge(selectedEdge.id, { 
                        style: { ...selectedEdge.style, stroke: e.target.value },
                        markerEnd: selectedEdge.markerEnd && typeof selectedEdge.markerEnd === 'object' && 'type' in selectedEdge.markerEnd ? { type: selectedEdge.markerEnd.type as MarkerType, color: e.target.value } : undefined,
                        markerStart: selectedEdge.markerStart && typeof selectedEdge.markerStart === 'object' && 'type' in selectedEdge.markerStart ? { type: selectedEdge.markerStart.type as MarkerType, color: e.target.value } : undefined,
                      })}
                      style={{ width: '50px', height: '30px', padding: '0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#888' }}>{t.propEdgeThickness || 'Thickness'}</label>
                    <span style={{ fontSize: '11px', color: '#4f46e5', fontWeight: 'bold' }}>{String(selectedEdge.style?.strokeWidth || 2)}px</span>
                  </div>
                  <input
                    type="range"
                    min="1" max="10"
                    value={Number(selectedEdge.style?.strokeWidth) || 2}
                    onChange={(e) => onUpdateEdge(selectedEdge.id, { style: { ...selectedEdge.style, strokeWidth: parseInt(e.target.value) } })}
                    style={{ width: '100%', accentColor: '#4f46e5' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', color: '#888' }}>{t.propEdgePattern || 'Pattern'}</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[
                      { id: undefined, label: t.propEdgePatternSolid || 'Solid' },
                      { id: '5,5', label: t.propEdgePatternDashed || 'Dashed' },
                      { id: '2,2', label: t.propEdgePatternDotted || 'Dotted' },
                    ].map(pat => {
                      const isActive = (selectedEdge.style?.strokeDasharray || undefined) === pat.id;
                      return (
                        <button
                          key={pat.id || 'solid'}
                          onClick={() => onUpdateEdge(selectedEdge.id, { style: { ...selectedEdge.style, strokeDasharray: pat.id } })}
                          style={{
                            flex: 1, padding: '6px', fontSize: '11px', borderRadius: '4px', cursor: 'pointer',
                            border: isActive ? '2px solid #4f46e5' : '1px solid #ddd',
                            background: isActive ? '#f5f7ff' : '#fff',
                            color: isActive ? '#4f46e5' : '#666',
                            fontWeight: isActive ? 'bold' : 'normal'
                          }}
                        >
                          {pat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#fcfcfc', border: '1px solid #eee', borderRadius: '6px' }}>
                  <input
                    type="checkbox"
                    id="edge-animated"
                    checked={selectedEdge.animated || false}
                    onChange={(e) => onUpdateEdge(selectedEdge.id, { animated: e.target.checked })}
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#4f46e5' }}
                  />
                  <label htmlFor="edge-animated" style={{ fontSize: '13px', cursor: 'pointer', fontWeight: 'bold', color: '#1a192b' }}>
                    {t.propEdgeAnimated || 'Animated'}
                  </label>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', color: '#888' }}>{t.propEdgeStart || 'Start Marker'}</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[
                      { id: undefined, label: t.propEdgeMarkerNone || 'None' },
                      { id: MarkerType.ArrowClosed, label: t.propEdgeMarkerArrow || 'Arrow' },
                    ].map(mkr => {
                      const isActive = ((selectedEdge.markerStart && typeof selectedEdge.markerStart === 'object' && 'type' in selectedEdge.markerStart ? selectedEdge.markerStart.type : undefined) || undefined) === mkr.id;
                      return (
                        <button
                          key={mkr.id || 'none'}
                          onClick={() => onUpdateEdge(selectedEdge.id, { 
                            markerStart: mkr.id ? { type: mkr.id as MarkerType, color: selectedEdge.style?.stroke || '#1a192b' } : undefined 
                          })}
                          style={{
                            flex: 1, padding: '6px', fontSize: '11px', borderRadius: '4px', cursor: 'pointer',
                            border: isActive ? '2px solid #4f46e5' : '1px solid #ddd',
                            background: isActive ? '#f5f7ff' : '#fff',
                            color: isActive ? '#4f46e5' : '#666',
                            fontWeight: isActive ? 'bold' : 'normal'
                          }}
                        >
                          {mkr.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', color: '#888' }}>{t.propEdgeEnd || 'End Marker'}</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[
                      { id: undefined, label: t.propEdgeMarkerNone || 'None' },
                      { id: MarkerType.ArrowClosed, label: t.propEdgeMarkerArrow || 'Arrow' },
                    ].map(mkr => {
                      const isActive = ((selectedEdge.markerEnd && typeof selectedEdge.markerEnd === 'object' && 'type' in selectedEdge.markerEnd ? selectedEdge.markerEnd.type : undefined) || undefined) === mkr.id;
                      return (
                        <button
                          key={mkr.id || 'none'}
                          onClick={() => onUpdateEdge(selectedEdge.id, { 
                            markerEnd: mkr.id ? { type: mkr.id as MarkerType, color: selectedEdge.style?.stroke || '#1a192b' } : undefined 
                          })}
                          style={{
                            flex: 1, padding: '6px', fontSize: '11px', borderRadius: '4px', cursor: 'pointer',
                            border: isActive ? '2px solid #4f46e5' : '1px solid #ddd',
                            background: isActive ? '#f5f7ff' : '#fff',
                            color: isActive ? '#4f46e5' : '#666',
                            fontWeight: isActive ? 'bold' : 'normal'
                          }}
                        >
                          {mkr.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                  <button
                    onClick={() => onDeleteEdge(selectedEdge.id)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#fee2e2',
                      color: '#ef4444',
                      border: '1px solid #f87171',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Trash2 size={16} />
                    {t.actionDeleteEdge || 'Delete Edge'}
                  </button>
                </div>
              </div>
            ) : !node ? (
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', color: '#999', textAlign: 'center' }}>
                <Layers size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                <div style={{ fontSize: '14px' }}>
                  {lang === 'ja' ? '編集するノードまたはエッジを選択してください' : 'Select a node or edge to edit properties'}
                </div>
              </div>
            ) : (
              <>

                <div style={{ display: 'flex', borderBottom: '1px solid #f5f5f5', background: '#fcfcfc', padding: '0 10px', flexShrink: 0, overflowX: 'auto' }}>
                  <div style={handleTabStyle('general')} onClick={() => setActiveTab('general')}>{t.propReset}</div>
                  {node.type === 'activity' && (
                    <>
                      <div style={handleTabStyle('inputs')} onClick={() => setActiveTab('inputs')}>{t.propInputs}</div>
                      <div style={handleTabStyle('outputs')} onClick={() => setActiveTab('outputs')}>{t.propOutputs}</div>
                      <div style={handleTabStyle('constraints')} onClick={() => setActiveTab('constraints')}>{t.propConstraints}</div>
                      <div style={handleTabStyle('assets')} onClick={() => setActiveTab('assets')}>{t.propAssets}</div>
                    </>
                  )}
                </div>

                <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {activeTab === 'general' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', color: '#888' }}>{t.propLabel}</label>
                        <input
                          type="text"
                          value={node.data.label}
                          onChange={(e) => onUpdate(node.id, { ...node.data, label: e.target.value })}
                          style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                        />
                      </div>

                      {node.data.isRoot && (isMember || isOperational) && (
                        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#f5f7ff', borderRadius: '8px', border: '1px solid #e0e7ff' }}>
                          <Lock size={16} color="#4f46e5" />
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1a192b', flex: 1 }}>
                            {lang === 'ja' ? 'ノートをロック (非会員に非表示)' : 'Lock Notes (Hide from Guests)'}
                          </span>
                          <input
                            type="checkbox"
                            checked={!!node.data.lockNotes}
                            onChange={(e) => onUpdate(node.id, { ...node.data, lockNotes: e.target.checked })}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                        </div>
                      )}

                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', color: '#888' }}>{t.propNotes}</label>
                        {(() => {
                          const rootNode = nodes.find(n => n.data.isRoot);
                          const isLocked = rootNode?.data.lockNotes && !isMember && !isOperational;
                          if (isLocked) {
                            return (
                              <div style={{ width: '100%', padding: '20px', border: '1px dashed #ddd', borderRadius: '4px', fontSize: '13px', background: '#f9f9f9', color: '#888', textAlign: 'center' }}>
                                <Lock size={20} style={{ display: 'block', margin: '0 auto 8px' }} />
                                {lang === 'ja' ? 'この内容はプレミアム会員限定です' : 'This content is for Premium members only'}
                              </div>
                            );
                          }
                          return (
                            <textarea
                              value={node.data.notes || ''}
                              onChange={(e) => onUpdate(node.id, { ...node.data, notes: e.target.value })}
                              rows={8}
                              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', resize: 'vertical' }}
                              placeholder={lang === 'ja' ? 'ノートを入力...' : 'Enter notes...'}
                            />
                          );
                        })()}
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', color: '#888' }}>{t.propColor}</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <input
                            type="color"
                            value={node.data.color || (node.type === 'context' ? '#e3f2fd' : '#ffffff')}
                            onChange={(e) => onUpdate(node.id, { ...node.data, color: e.target.value })}
                            style={{ width: '50px', height: '30px', padding: '0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
                          />
                          <button
                            onClick={() => onUpdate(node.id, { ...node.data, color: undefined })}
                            style={{ fontSize: '11px', color: '#666', background: '#f5f5f5', border: '1px solid #ddd', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            {t.propReset}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', color: '#888' }}>
                          {lang === 'ja' ? '背景画像 URL' : 'Background Image URL'}
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            value={node.data.bgImage || ''}
                            onChange={(e) => onUpdate(node.id, { ...node.data, bgImage: e.target.value })}
                            style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                            placeholder="https://example.com/image.png"
                          />
                          {node.data.bgImage && (
                            <button
                              onClick={() => onUpdate(node.id, { ...node.data, bgImage: undefined })}
                              style={{ padding: '8px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', color: '#888' }}>Icon</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '12px' }}>
                          {NODE_ICONS.map((i: NodeIconType) => {
                            const Icon = i.icon;
                            const isSelected = (node.data.icon || 'none') === i.id;
                            return (
                              <button
                                key={i.id}
                                onClick={() => onUpdate(node.id, { ...node.data, icon: i.id })}
                                style={{
                                  padding: '8px',
                                  borderRadius: '6px',
                                  border: isSelected ? '2px solid #4f46e5' : '1px solid #eee',
                                  background: isSelected ? '#f5f7ff' : '#fff',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  aspectRatio: '1/1'
                                }}
                                title={i.label}
                              >
                                {Icon ? <Icon size={18} color={isSelected ? '#4f46e5' : '#666'} /> : <X size={14} color="#ccc" />}
                              </button>
                            );
                          })}
                        </div>

                        {node.data.icon && node.data.icon !== 'none' && (
                          <>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', color: '#888' }}>
                              {lang === 'ja' ? 'アイコン位置' : 'Icon Position'}
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                              {[
                                { id: 'top-left', label: 'TL' },
                                { id: 'top-center', label: 'T', disabled: true },
                                { id: 'top-right', label: 'TR' },
                                { id: 'center-left', label: 'L', disabled: true },
                                { id: 'center', label: 'C' },
                                { id: 'center-right', label: 'R', disabled: true },
                                { id: 'bottom-left', label: 'BL' },
                                { id: 'bottom-center', label: 'B', disabled: true },
                                { id: 'bottom-right', label: 'BR' },
                              ].map(pos => (
                                <button
                                  key={pos.id}
                                  onClick={() => !pos.disabled && onUpdate(node.id, { ...node.data, iconPosition: pos.id })}
                                  disabled={pos.disabled}
                                  style={{
                                    padding: '4px',
                                    fontSize: '10px',
                                    borderRadius: '4px',
                                    border: (node.data.iconPosition || 'center') === pos.id ? '2px solid #4f46e5' : '1px solid #eee',
                                    background: pos.disabled ? '#f9f9f9' : ((node.data.iconPosition || 'center') === pos.id ? '#f5f7ff' : '#fff'),
                                    color: pos.disabled ? '#ccc' : '#666',
                                    cursor: pos.disabled ? 'not-allowed' : 'pointer'
                                  }}
                                >
                                  {pos.label}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      <div style={{ padding: '12px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '11px', color: '#666', marginBottom: '12px', textTransform: 'uppercase' }}>
                          {t.propLabelPosition}
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontSize: '10px', color: '#888', marginBottom: '4px' }}>{t.propPlacement}</label>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {['inside', 'outside'].map(p => (
                              <button
                                key={p}
                                onClick={() => onUpdate(node.id, { ...node.data, labelPlacement: p })}
                                style={{
                                  flex: 1, padding: '6px', fontSize: '11px', borderRadius: '4px', cursor: 'pointer',
                                  border: (node.data.labelPlacement || 'inside') === p ? '2px solid #4f46e5' : '1px solid #ddd',
                                  background: (node.data.labelPlacement || 'inside') === p ? '#f5f7ff' : '#fff',
                                }}
                              >
                                {p === 'inside' ? t.posInside : t.posOutside}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontSize: '10px', color: '#888', marginBottom: '4px' }}>{t.propVAlign}</label>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {['top', 'middle', 'bottom'].map(v => (
                              <button
                                key={v}
                                onClick={() => onUpdate(node.id, { ...node.data, labelVAlign: v })}
                                style={{
                                  flex: 1, padding: '6px', fontSize: '11px', borderRadius: '4px', cursor: 'pointer',
                                  border: (node.data.labelVAlign || 'middle') === v ? '2px solid #4f46e5' : '1px solid #ddd',
                                  background: (node.data.labelVAlign || 'middle') === v ? '#f5f7ff' : '#fff',
                                }}
                              >
                                {v === 'top' ? t.posTop : v === 'middle' ? t.posMiddle : t.posBottom}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', color: '#888', marginBottom: '4px' }}>{t.propHAlign}</label>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {['left', 'center', 'right'].map(h => (
                              <button
                                key={h}
                                onClick={() => onUpdate(node.id, { ...node.data, labelHAlign: h })}
                                style={{
                                  flex: 1, padding: '6px', fontSize: '11px', borderRadius: '4px', cursor: 'pointer',
                                  border: (node.data.labelHAlign || 'center') === h ? '2px solid #4f46e5' : '1px solid #ddd',
                                  background: (node.data.labelHAlign || 'center') === h ? '#f5f7ff' : '#fff',
                                }}
                              >
                                {h === 'left' ? t.posLeft : h === 'center' ? t.posCenter : t.posRight}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'inputs' && node.type === 'activity' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', color: '#2196f3' }}>{t.propInputCount}</label>
                        <input
                          type="number" min={1} max={10}
                          value={node.data.inputs || 1}
                          onChange={(e) => onUpdate(node.id, { ...node.data, inputs: parseInt(e.target.value) || 1 })}
                          style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                        />
                      </div>
                      {Array.from({ length: node.data.inputs || 1 }).map((_, i) => (
                        <div key={`in-data-${i}`} style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#2196f3', marginBottom: '8px' }}>INPUT {i + 1}</div>
                          <input
                            type="text" placeholder={t.propName}
                            value={node.data.handleData?.[`in-${i}`]?.name || ''}
                            onChange={(e) => {
                              const handleData = { ...node.data.handleData, [`in-${i}`]: { ...node.data.handleData?.[`in-${i}`], name: e.target.value } };
                              onUpdate(node.id, { ...node.data, handleData });
                            }}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', marginBottom: '8px' }}
                          />
                          <textarea
                            placeholder={t.propDescription}
                            value={node.data.handleData?.[`in-${i}`]?.description || ''}
                            onChange={(e) => {
                              const handleData = { ...node.data.handleData, [`in-${i}`]: { ...node.data.handleData?.[`in-${i}`], description: e.target.value } };
                              onUpdate(node.id, { ...node.data, handleData });
                            }}
                            rows={3}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px', resize: 'none' }}
                          />
                        </div>
                      ))}
                    </>
                  )}

                  {activeTab === 'outputs' && node.type === 'activity' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', color: '#ff4d4f' }}>{t.propOutputCount}</label>
                        <input
                          type="number" min={1} max={10}
                          value={node.data.outputs || 1}
                          onChange={(e) => onUpdate(node.id, { ...node.data, outputs: parseInt(e.target.value) || 1 })}
                          style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                        />
                      </div>
                      {Array.from({ length: node.data.outputs || 1 }).map((_, i) => (
                        <div key={`out-data-${i}`} style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#ff4d4f', marginBottom: '8px' }}>OUTPUT {i + 1}</div>
                          <input
                            type="text" placeholder={t.propName}
                            value={node.data.handleData?.[`out-${i}`]?.name || ''}
                            onChange={(e) => {
                              const handleData = { ...node.data.handleData, [`out-${i}`]: { ...node.data.handleData?.[`out-${i}`], name: e.target.value } };
                              onUpdate(node.id, { ...node.data, handleData });
                            }}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', marginBottom: '8px' }}
                          />
                          <textarea
                            placeholder={t.propDescription}
                            value={node.data.handleData?.[`out-${i}`]?.description || ''}
                            onChange={(e) => {
                              const handleData = { ...node.data.handleData, [`out-${i}`]: { ...node.data.handleData?.[`out-${i}`], description: e.target.value } };
                              onUpdate(node.id, { ...node.data, handleData });
                            }}
                            rows={3}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px', resize: 'none' }}
                          />
                        </div>
                      ))}
                    </>
                  )}

                  {activeTab === 'constraints' && node.type === 'activity' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', color: '#4caf50' }}>{t.propConstraintCount}</label>
                        <input
                          type="number" min={1} max={10}
                          value={node.data.constraints || 1}
                          onChange={(e) => onUpdate(node.id, { ...node.data, constraints: parseInt(e.target.value) || 1 })}
                          style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                        />
                      </div>
                      {Array.from({ length: node.data.constraints || 1 }).map((_, i) => (
                        <div key={`constraint-data-${i}`} style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#4caf50', marginBottom: '8px' }}>CONSTRAINT {i + 1}</div>
                          <input
                            type="text" placeholder={t.propName}
                            value={node.data.handleData?.[`constraint-${i}`]?.name || ''}
                            onChange={(e) => {
                              const handleData = { ...node.data.handleData, [`constraint-${i}`]: { ...node.data.handleData?.[`constraint-${i}`], name: e.target.value } };
                              onUpdate(node.id, { ...node.data, handleData });
                            }}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', marginBottom: '8px' }}
                          />
                          <textarea
                            placeholder={t.propDescription}
                            value={node.data.handleData?.[`constraint-${i}`]?.description || ''}
                            onChange={(e) => {
                              const handleData = { ...node.data.handleData, [`constraint-${i}`]: { ...node.data.handleData?.[`constraint-${i}`], description: e.target.value } };
                              onUpdate(node.id, { ...node.data, handleData });
                            }}
                            rows={3}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px', resize: 'none' }}
                          />
                        </div>
                      ))}
                    </>
                  )}

                  {activeTab === 'assets' && node.type === 'activity' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', color: '#ff9800' }}>{t.propAssetCount}</label>
                        <input
                          type="number" min={1} max={10}
                          value={node.data.assets || 1}
                          onChange={(e) => onUpdate(node.id, { ...node.data, assets: parseInt(e.target.value) || 1 })}
                          style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                        />
                      </div>
                      {Array.from({ length: node.data.assets || 1 }).map((_, i) => (
                        <div key={`asset-data-${i}`} style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#ff9800', marginBottom: '8px' }}>ASSET {i + 1}</div>
                          <input
                            type="text" placeholder={t.propName}
                            value={node.data.handleData?.[`asset-${i}`]?.name || ''}
                            onChange={(e) => {
                              const handleData = { ...node.data.handleData, [`asset-${i}`]: { ...node.data.handleData?.[`asset-${i}`], name: e.target.value } };
                              onUpdate(node.id, { ...node.data, handleData });
                            }}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', marginBottom: '8px' }}
                          />
                          <textarea
                            placeholder={t.propDescription}
                            value={node.data.handleData?.[`asset-${i}`]?.description || ''}
                            onChange={(e) => {
                              const handleData = { ...node.data.handleData, [`asset-${i}`]: { ...node.data.handleData?.[`asset-${i}`], description: e.target.value } };
                              onUpdate(node.id, { ...node.data, handleData });
                            }}
                            rows={3}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px', resize: 'none' }}
                          />
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <div style={{ padding: '15px 20px', background: '#fcfcfc', borderTop: '1px solid #f5f5f5', fontSize: '10px', color: '#999', flexShrink: 0 }}>
                  <div style={{ marginBottom: '6px' }}>ID: {node.id.slice(0, 8)}... | {lang === 'ja' ? '種別' : 'Kind'}: {node.type}</div>
                  <div style={{ fontStyle: 'italic', opacity: 0.7 }}>Taking modeling to new heights with Antigravity</div>
                </div>
              </>
            )}
          </div>
        )
        }
      </div >
    </aside >
  );
};


const ContextMenu = ({ id, top, left, type, data, onUpdate, onDelete, onClose, t, lang, showConfirm }: any) => {
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        zIndex: 100,
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        padding: '5px 0',
        minWidth: '150px'
      }}
      onMouseLeave={onClose}
    >
      <div style={{ padding: '8px 15px', borderBottom: '1px solid #eee', fontSize: '11px', color: '#999', fontWeight: 'bold' }}>
        {type.toUpperCase()} {lang === 'ja' ? 'アクション' : 'ACTIONS'}
      </div>

      {type === 'activity' && (
        <>
          <button
            onClick={() => { onUpdate(id, { ...data, inputs: (data.inputs || 1) + 1 }); onClose(); }}
            style={{ width: '100%', padding: '10px 15px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}
          >
            {t.actionAddIn} <span>+</span>
          </button>
          <button
            onClick={() => { if (data.inputs > 1) onUpdate(id, { ...data, inputs: data.inputs - 1 }); onClose(); }}
            style={{ width: '100%', padding: '10px 15px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', color: data.inputs <= 1 ? '#ccc' : '#333' }}
            disabled={data.inputs <= 1}
          >
            {t.actionRemoveIn}
          </button>
          <div style={{ height: '1px', background: '#eee', margin: '5px 0' }} />
          <button
            onClick={() => { onUpdate(id, { ...data, outputs: (data.outputs || 1) + 1 }); onClose(); }}
            style={{ width: '100%', padding: '10px 15px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}
          >
            {t.actionAddOut} <span>+</span>
          </button>
          <button
            onClick={() => { if (data.outputs > 1) onUpdate(id, { ...data, outputs: data.outputs - 1 }); onClose(); }}
            style={{ width: '100%', padding: '10px 15px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', color: data.outputs <= 1 ? '#ccc' : '#333' }}
            disabled={data.outputs <= 1}
          >
            {t.actionRemoveOut}
          </button>
          <div style={{ height: '1px', background: '#eee', margin: '5px 0' }} />
          <button
            onClick={() => { onUpdate(id, { ...data, constraints: (data.constraints || 1) + 1 }); onClose(); }}
            style={{ width: '100%', padding: '10px 15px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', color: '#4caf50', display: 'flex', justifyContent: 'space-between' }}
          >
            {t.actionAddCon} <span>+</span>
          </button>
          <button
            onClick={() => { if (data.constraints > 1) onUpdate(id, { ...data, constraints: data.constraints - 1 }); onClose(); }}
            style={{ width: '100%', padding: '10px 15px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', color: data.constraints <= 1 ? '#ccc' : '#4caf50' }}
            disabled={data.constraints <= 1}
          >
            {t.actionRemoveCon}
          </button>
          <div style={{ height: '1px', background: '#eee', margin: '5px 0' }} />
          <button
            onClick={() => { onUpdate(id, { ...data, assets: (data.assets || 1) + 1 }); onClose(); }}
            style={{ width: '100%', padding: '10px 15px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', color: '#ff9800', display: 'flex', justifyContent: 'space-between' }}
          >
            {t.actionAddAs} <span>+</span>
          </button>
          <button
            onClick={() => { if (data.assets > 1) onUpdate(id, { ...data, assets: data.assets - 1 }); onClose(); }}
            style={{ width: '100%', padding: '10px 15px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', color: data.assets <= 1 ? '#ccc' : '#ff9800' }}
            disabled={data.assets <= 1}
          >
            {t.actionRemoveAs}
          </button>
          <div style={{ height: '1px', background: '#eee', margin: '5px 0' }} />
        </>
      )}

      <button
        onClick={() => {
          onClose();
          showConfirm(
            t.actionDelete,
            t.actionConfirmDelete,
            () => onDelete(id)
          );
        }}
        style={{ width: '100%', padding: '10px 15px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', color: '#ff4d4f' }}
      >
        {t.actionDelete}
      </button>
    </div>
  );
};

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, lang }: any) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center',
      alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '400px',
        padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid #eee'
      }}>
        <div style={{ fontSize: '18px', fontWeight: '800', color: '#1a192b' }}>{title}</div>
        <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>{message}</div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#666' }}
          >
            {lang === 'ja' ? 'キャンセル' : 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#1a192b', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#fff' }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Initial State ---
const INITIAL_ROOT_NODE: Node = {
  id: 'root_context',
  type: 'context',
  position: { x: 0, y: 0 },
  data: { label: '対象コンテキスト', isRoot: true },
  style: { width: 1200, height: 800 },
  width: 1200,
  height: 800,
  zIndex: 0,
  draggable: true,
};

const INITIAL_EDGES: Edge[] = [];

let renderCount = 0;

const DnDFlow = React.memo(() => {
  renderCount++;
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  // const { lang, setLang, isMember, isOperational, roles } = useLanguage();
  // HARDCODED FOR DIAGNOSTIC STABILITY
  const lang = 'ja';
  const isMember = true;
  const isOperational = true;
  const roles = ['admin'];
  const setLang = () => {};
  
  const t = (translations as any)[lang];

  // --- Page Management State ---
  const [pages, setPages] = useState<Array<{ id: string, name: string, nodes: Node[], edges: Edge[] }>>([
    { id: 'default', name: lang === 'ja' ? 'ページ 1' : 'Page 1', nodes: [INITIAL_ROOT_NODE], edges: INITIAL_EDGES }
  ]);
  const [activePageId, setActivePageId] = useState<string>('default');

  const [nodes, setNodes, onNodesChange] = useNodesState([INITIAL_ROOT_NODE]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);

  // Sync root node label with language without re-creating the object
  useEffect(() => {
    setNodes(nds => nds.map(n => 
      n.id === 'root_context' 
        ? { ...n, data: { ...n.data, label: lang === 'ja' ? '対象コンテキスト' : 'Target Context' } } 
        : n
    ));
    setPages(prev => prev.map(p => ({
      ...p,
      name: p.id === 'default' ? (lang === 'ja' ? 'ページ 1' : 'Page 1') : p.name
    })));
  }, [lang, setNodes]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [menu, setMenu] = useState<any>(null);
  const [tooltip, setTooltip] = useState<{ content: string, x: number, y: number, title?: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNuclearReset = () => {
    // Use window.confirm for better scope clarity
    if (typeof window !== 'undefined' && window.confirm("Reset editor state and force re-mount?")) {
      setIsMounted(false);
      localStorage.removeItem('abc_lib_cache');
      setTimeout(() => setIsMounted(true), 100);
    }
  };

  console.log("[ABC] Render State - Nodes:", nodes.length, "Edges:", edges.length);
  if (typeof window !== 'undefined') { (window as any).nodes = nodes; (window as any).edges = edges; }
  const [showGuide, setShowGuide] = useState(false);
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [editingLibraryComponent, setEditingLibraryComponent] = useState<any>(null);
  const [dbComponents, setDbComponents] = useState<any[]>([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmConfig({ isOpen: true, title, message, onConfirm: () => { onConfirm(); setConfirmConfig(prev => ({ ...prev, isOpen: false })); } });
  };

  const refreshLibrary = useCallback(async () => {
    // Initial load from cache
    const cache = localStorage.getItem('abc_lib_cache');
    if (cache) {
      setDbComponents(JSON.parse(cache));
    }

    setIsLibraryLoading(true);
    try {
      const res = await fetch('/api/components');
      const data = await res.json();
      if (Array.isArray(data)) {
        setDbComponents(data);
        try {
          localStorage.setItem('abc_lib_cache', JSON.stringify(data));
        } catch (e) {
          console.warn('Failed to cache library:', e);
        }
      }
    } catch (err) {
      console.error('Failed to fetch library:', err);
    } finally {
      setIsLibraryLoading(false);
    }
  }, []);

  const fetchFullComponentData = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/components/${id}`); // We might need a single component API, or just fetch all without metadataOnly
      // Since we don't have a single GET id API, we'll just fetch all for now or I'll add a quick single API if needed.
      // Wait, I can just use GET /api/components?id=xxx
      const res2 = await fetch(`/api/components?id=${id}`);
      const data = await res2.json();
      // data is an array of 1 or matching components
      const matched = Array.isArray(data) ? data.find(c => c.id === id) : data;
      return matched?.data;
    } catch (err) {
      console.error('Failed to fetch full data:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    refreshLibrary();
  }, [refreshLibrary]);

  const ensureRootContext = useCallback((nds: Node[]) => {
    const hasRoot = nds.some(n => n.type === 'context' && n.data?.isRoot);
    if (!hasRoot) {
      const rootNode: Node = {
        id: 'root_context',
        type: 'context',
        position: { x: 0, y: 0 },
        data: { label: lang === 'ja' ? '対象コンテキスト' : 'Target Context', isRoot: true },
        style: { width: 1200, height: 800 },
        zIndex: 0,
        draggable: true,
      };
      
      // Set parentId for loose nodes to provide sub-flow movement
      const nestedNodes = nds.map(n => ({
        ...n,
        parentId: n.parentId || 'root_context'
      }));
      return [rootNode, ...nestedNodes];
    }
    return nds;
  }, [lang]);
  


  // Handle template loading from URL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const templateId = urlParams.get('template');

    if (templateId && dbComponents.length > 0) {
      const template = dbComponents.find(c => c.id === templateId);
      if (template) {
        handleSelectComponent({ ...template, loadMode: 'load' });
        // Clear param to avoid re-loading on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [dbComponents]);

  // Sync internal state to pages when nodes/edges change
  const syncCurrentPage = useCallback(() => {
    setPages(prev => prev.map(p => p.id === activePageId ? { ...p, nodes, edges } : p));
  }, [activePageId, nodes, edges]);

  // Handle page switching
  const switchPage = (pageId: string) => {
    // First save current state to the active page
    syncCurrentPage();

    // Then load the new page state
    const targetPage = pages.find(p => p.id === pageId);
    if (targetPage) {
      setActivePageId(pageId);
      setNodes(targetPage.nodes);
      setEdges(targetPage.edges);
      setSelectedNodeId(null);
    }
  };

  const addPage = () => {
    const newId = `page_${Date.now()}`;
    const pagePrefix = lang === 'ja' ? 'ページ' : 'Page';
    const newRootNode: Node = {
      id: `root_context_${Date.now()}`,
      type: 'context',
      position: { x: 0, y: 0 },
      data: { label: lang === 'ja' ? '対象コンテキスト' : 'Target Context', isRoot: true },
      style: { width: 1200, height: 800 },
    };
    const newPage = { id: newId, name: `${pagePrefix} ${pages.length + 1}`, nodes: [newRootNode], edges: [] };
    setPages([...pages, newPage]);
    switchPage(newId);
  };

  const deletePage = (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation();
    if (pages.length === 1) {
      alert(t.guardLastPage);
      return;
    }
    showConfirm(
      t.confirmDeletePage,
      lang === 'ja' ? 'このページを削除しますか？' : 'Are you sure you want to delete this page?',
      () => {
        const newPages = pages.filter(p => p.id !== pageId);
        setPages(newPages);
        if (activePageId === pageId) {
          // Switch to the first available page
          const firstPage = newPages[0];
          setActivePageId(firstPage.id);
          setNodes(firstPage.nodes);
          setEdges(firstPage.edges);
        }
      }
    );
  };

  const handleSelectComponent = (comp: any) => {
    const isLoad = comp.loadMode === 'load';
    const data = getCompData(comp);
    // Revert parentId hack to avoid "Parent node not found" crash
    const compNodes = JSON.parse(JSON.stringify(data.nodes));
    const compEdges = data.edges.map((e: any) => ({
      ...e,
      markerEnd: e.markerEnd || { type: MarkerType.ArrowClosed, color: '#1a192b' }
    }));

    if (isLoad) {
      setIsComponentModalOpen(false);
      
      const compEdges = data.edges.map((e: any) => ({
        ...e,
        markerEnd: e.markerEnd || { type: 'arrowclosed' as any, color: '#1a192b' }
      }));

      // Find the root in the template (can be via isRoot or just the top-level context)
      const templateRoot = compNodes.find((n: any) => n.data?.isRoot || (n.type === 'context' && !n.parentId));

      // Root-preserving update: Keep the same root object if it exists
      setNodes(prev => {
        const existingRoot = prev.find(n => n.id === 'root_context') || INITIAL_ROOT_NODE;
        
        // Merge template root values into our stable root
        const updatedRoot = {
          ...existingRoot,
          data: { ...existingRoot.data, ...(templateRoot?.data || {}), isRoot: true },
          style: { ...existingRoot.style, ...(templateRoot?.style || {}) },
          zIndex: 0,
        };

        // All other nodes: nested under 'root_context' for sub-flow movement
        const templateRootPos = templateRoot?.position || { x: 0, y: 0 };
        const processedNodes = compNodes
          .filter((n: any) => n.id !== templateRoot?.id)
          .map((n: any) => ({
            ...n,
            position: {
              x: n.position.x - templateRootPos.x + 50,
              y: n.position.y - templateRootPos.y + 50
            },
            parentId: 'root_context',
            zIndex: 10,
            draggable: true,
            connectable: true,
            selectable: true,
            selected: false
          }));

        return [updatedRoot, ...processedNodes];
      });
      
      // Remap edges: if they pointed to templateRoot, point to 'root_context'
      // But keep other IDs as they are
      const processedEdges = compEdges.map((e: any) => ({
        ...e,
        source: e.source === templateRoot?.id ? 'root_context' : e.source,
        target: e.target === templateRoot?.id ? 'root_context' : e.target
      }));

      setEdges(processedEdges);
      
      console.log("[ABC] Loading - Template Root:", templateRoot?.id, "Nodes:", compNodes.length, "Edges:", compEdges.length);
      
      setTimeout(() => {
        if (reactFlowInstance) reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
      }, 100);
      return;
    }

    setIsComponentModalOpen(false);

    // Append mode - nest under current root_context
    const prefix = `comp_${Date.now()}_`;
    const offset = { x: 50, y: 50 };
    
    // Find our current root context position to calculate relative coordinates
    const currentRoot = nodes.find(n => n.data?.isRoot);
    const rootPos = currentRoot?.position || { x: 0, y: 0 };

    const templateRoot = compNodes.find((n: any) => n.data?.isRoot);
    const templateRootPos = templateRoot?.position || { x: 0, y: 0 };

    const newNodes = compNodes
      .filter((n: any) => n.id !== templateRoot?.id)
      .map((n: Node) => {
        return {
          ...n,
          id: `${prefix}${n.id}`,
          parentId: 'root_context',
          position: { 
            x: (n.position?.x || 0) - templateRootPos.x + offset.x, 
            y: (n.position?.y || 0) - templateRootPos.y + offset.y 
          },
          selected: false,
          draggable: true,
          connectable: true,
          selectable: true
        };
      });

    const newEdges = compEdges.map((e: Edge) => ({
      ...e,
      id: `${prefix}${e.id}`,
      source: e.source === templateRoot?.id ? 'root_context' : `${prefix}${e.source}`,
      target: e.target === templateRoot?.id ? 'root_context' : `${prefix}${e.target}`,
      selected: false,
      animated: true,
      style: { stroke: '#1a192b', strokeWidth: 2 }, 
      markerEnd: { type: MarkerType.ArrowClosed, color: '#1a192b' } 
    }));

    setNodes(nds => nds.map(n => ({ ...n, selected: false })).concat(newNodes));
    setEdges(eds => eds.map(e => ({ ...e, selected: false })).concat(newEdges));
    
    setTimeout(() => {
      if (reactFlowInstance) reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
    }, 100);
  };

  const onNodeContextMenu = useCallback(
    (event: any, node: any) => {
      event.preventDefault();
      setSelectedNodeId(node.id);

      const pane = reactFlowWrapper.current?.getBoundingClientRect();
      if (pane) {
        setMenu({
          id: node.id,
          top: event.clientY - pane.top,
          left: event.clientX - pane.left,
          type: node.type,
          data: node.data
        });
      }
    },
    [setMenu]
  );

  const onNodeMouseEnter = useCallback((event: any, node: any) => {
    if (nodes.some(n => n.dragging)) return;
    const pane = reactFlowWrapper.current?.getBoundingClientRect();
    if (!pane) return;

    const handleElement = event.target.closest('.react-flow__handle');
    if (handleElement) {
      const handleId = handleElement.getAttribute('data-handleid');
      const handleData = node.data.handleData?.[handleId];
      if (handleData?.description) {
        setTooltip({
          content: handleData.description,
          x: event.clientX - pane.left,
          y: event.clientY - pane.top,
          title: handleId.startsWith('in') ? t.propInputs : t.propOutputs
        });
        return;
      }
    }

    const rootNode = nodes.find(n => n.data.isRoot);
    const isNotesLocked = rootNode?.data.lockNotes && !isMember && !isOperational;
    if (node.data.notes && !isNotesLocked) {
      setTooltip({
        content: node.data.notes,
        x: event.clientX - pane.left,
        y: event.clientY - pane.top,
        title: t.propNotes
      });
    } else if (node.data.notes && isNotesLocked) {
      setTooltip({
        content: lang === 'ja' ? 'プレミアム会員限定コンテンツ' : 'Premium Member Content',
        x: event.clientX - pane.left,
        y: event.clientY - pane.top,
        title: t.propNotes
      });
    }
  }, [nodes, isMember, isOperational, lang, t]);

  const onNodeMouseMove = useCallback((event: any, node: any) => {
    if (nodes.some(n => n.dragging)) return;
    const pane = reactFlowWrapper.current?.getBoundingClientRect();
    if (!pane) return;

    const handleElement = event.target.closest('.react-flow__handle');
    if (handleElement) {
      const handleId = handleElement.getAttribute('data-handleid');
      const handleData = node.data.handleData?.[handleId];
      if (handleData?.description) {
        setTooltip({
          content: handleData.description,
          x: event.clientX - pane.left,
          y: event.clientY - pane.top,
          title: handleId.startsWith('in') ? t.propInputs : t.propOutputs
        });
        return;
      } else {
        setTooltip(null);
        return;
      }
    }

    const rootNode = nodes.find(n => n.data.isRoot);
    const isNotesLocked = rootNode?.data.lockNotes && !isMember && !isOperational;
    if (node.data.notes && !isNotesLocked) {
      setTooltip({
        content: node.data.notes,
        x: event.clientX - pane.left,
        y: event.clientY - pane.top,
        title: t.propNotes
      });
    } else if (node.data.notes && isNotesLocked) {
      setTooltip({
        content: lang === 'ja' ? 'プレミアム会員限定コンテンツ' : 'Premium Member Content',
        x: event.clientX - pane.left,
        y: event.clientY - pane.top,
        title: t.propNotes
      });
    } else {
      setTooltip(null);
    }
  }, [nodes, isMember, isOperational, lang, t]);

  const onNodeMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNodeId(node.id);
    setMenu(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setMenu(null);
  }, []);

  const updateNodeData = useCallback((id: string, data: any) => {
    setNodes((nds) => nds.map((node) => node.id === id ? { ...node, data } : node));
  }, [setNodes]);

  const updateEdgeData = useCallback((id: string, updates: Partial<Edge>) => {
    setEdges((eds) => eds.map((edge) => {
      if (edge.id !== id) return edge;
      const newEdge = { ...edge, ...updates };
      if (updates.style) newEdge.style = { ...edge.style, ...updates.style };
      return newEdge;
    }));
  }, [setEdges]);

  const deleteEdge = useCallback((id: string) => {
    setEdges((eds) => eds.filter(edge => edge.id !== id));
  }, [setEdges]);

  const deleteNode = useCallback((id: string) => {
    const nodeToDelete = nodes.find(n => n.id === id);
    if (nodeToDelete?.data?.isRoot) {
      alert(lang === 'ja' ? 'ルート・コンテキストは削除できません。' : 'Root Context cannot be deleted.');
      return;
    }
    setNodes((nds) => {
      const newNodes = nds.filter((node) => node.id !== id);
      return ensureRootContext(newNodes);
    });
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  }, [nodes, setNodes, setEdges, lang, ensureRootContext]);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      console.log("[ABC] onConnect triggered:", params);
      setEdges((eds) => addEdge({ 
        ...params, 
        animated: true, 
        style: { stroke: '#1a192b', strokeWidth: 2 }, 
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1a192b' } 
      }, eds));
    },
    [setEdges]
  );


  const onDelete = useCallback(() => {
    const hasRoot = nodes.some(n => n.selected && n.data?.isRoot);
    if (hasRoot) {
      alert(lang === 'ja' ? 'ルート・コンテキストは削除できません。' : 'Root Context cannot be deleted.');
      return;
    }
    setNodes((nds) => {
      const newNodes = nds.filter((node) => !node.selected);
      return ensureRootContext(newNodes);
    });
    setEdges((eds) => eds.filter((edge) => !edge.selected));
  }, [nodes, setNodes, setEdges, lang, ensureRootContext]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Find root context first
      const rootContext = nodes.find(n => n.data?.isRoot);

      const parentNode = nodes.find((n) => {
        if (n.data?.isRoot) return false; // Prefer inner containers
        const nodeWidth = n.width || NODE_WIDTH;
        const nodeHeight = n.height || NODE_HEIGHT;
        return (
          position.x >= n.position.x &&
          position.x <= n.position.x + nodeWidth &&
          position.y >= n.position.y &&
          position.y <= n.position.y + nodeHeight
        );
      }) || rootContext;

      const newNode: Node = {
        id: `node_${Date.now()}`,
        type,
        position: parentNode
          ? { x: position.x - parentNode.position.x, y: position.y - parentNode.position.y }
          : position,
        data: {
          label: `${type.charAt(0).toUpperCase() + type.slice(1)}`,
          inputs: type === 'activity' ? 1 : 0,
          outputs: type === 'activity' ? 1 : 0,
          constraints: type === 'activity' ? 1 : 0,
          assets: type === 'activity' ? 1 : 0,
        },
        style: { width: NODE_WIDTH, height: NODE_HEIGHT },
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        parentId: parentNode?.id,
        extent: 'parent',
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, nodes, setNodes]
  );

  const exportFlow = useCallback((partial = false) => {
    const nodesToExport = partial ? nodes.filter(n => n.selected) : nodes;
    const nodeIds = new Set(nodesToExport.map(n => n.id));
    const edgesToExport = partial
      ? edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
      : edges;

    if (partial && nodesToExport.length === 0) {
      alert(t.alertNoExport);
      return;
    }

    const data = { nodes: nodesToExport, edges: edgesToExport };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const suffix = partial ? 'partial' : 'full';
    link.download = `abc-flow-${suffix}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const onImportFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, append = false) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (data.nodes && data.edges) {
          if (append) {
            // Apply unique IDs for appended items
            const prefix = `imp_${Date.now()}_`;
            const newNodes = data.nodes.map((n: Node) => ({
              ...n,
              id: `${prefix}${n.id}`,
              parentId: n.parentId ? `${prefix}${n.parentId}` : undefined,
              selected: true // Highlight imported items
            }));
            const newEdges = data.edges.map((e: Edge) => ({
              ...e,
              id: `${prefix}${e.id}`,
              source: `${prefix}${e.source}`,
              target: `${prefix}${e.target}`,
              selected: true
            }));
            setNodes(nds => nds.map(n => ({ ...n, selected: false })).concat(newNodes));
            setEdges(eds => eds.map(e => ({ ...e, selected: false })).concat(newEdges));
          } else {
            setNodes(data.nodes);
            setEdges(data.edges);
          }
        } else {
          alert(t.alertInvalidFile);
        }
      } catch (err) {
        alert(t.alertLoadFail);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [setNodes, setEdges]);

  const loadTemplate = (comp: any) => {
    const { nodes: tNodes, edges: tEdges } = getCompData(comp);
    const finalNodes = ensureRootContext(tNodes);
    
    if (nodes.length > 0) {
      showConfirm(
        t.libLoad,
        t.confirmOverwrite,
        () => {
          setNodes(finalNodes);
          setEdges(tEdges);
          // Auto-adjust view after slight delay to ensure render
          setTimeout(() => {
             if (reactFlowInstance) reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
          }, 100);
        }
      );
      return;
    }
    setNodes(finalNodes);
    setEdges(tEdges);
    setTimeout(() => {
       if (reactFlowInstance) reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
    }, 100);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const appendFlagRef = useRef<boolean>(false);

  const triggerImport = (append = false) => {
    appendFlagRef.current = append;
    fileInputRef.current?.click();
  };

  const handleOpenComponentModal = () => setIsComponentModalOpen(true);
  const handleCloseComponentModal = () => setIsComponentModalOpen(false);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;
  const selectedEdge = edges.find(e => e.selected) || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', paddingTop: '64px', boxSizing: 'border-box', background: '#fff' }}>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          onImport={() => (document.getElementById('import-file') as HTMLInputElement).click()}
          onExport={() => exportFlow(false)}
          onLoadTemplate={loadTemplate}
          onDeleteSelected={onDelete}
          onClearAll={() => {
            showConfirm(
              lang === 'ja' ? 'すべてクリア' : 'Clear All',
              lang === 'ja' ? 'すべての内容をクリアしますか？' : 'Clear all content?',
              () => {
                setNodes(ensureRootContext([]));
                setEdges([]);
              }
            );
          }}
          onPartialImport={() => (document.getElementById('import-file-partial') as HTMLInputElement).click()}
          onPartialExport={() => exportFlow(true)}
          showGuide={showGuide}
          onToggleGuide={() => setShowGuide(!showGuide)}
          onSaveToLibrary={async () => {
            setEditingLibraryComponent(null);
            setIsSaveModalOpen(true);
          }}
          onOpenComponentModal={() => {
            refreshLibrary();
            setIsComponentModalOpen(true);
          }}
          dbComponents={dbComponents}
          isOperational={isOperational}
          isMember={isMember}
          lang={lang}
          setLang={setLang}
          t={t}
        />
        <ComponentSaveModal
          isOpen={isSaveModalOpen}
          onClose={() => { setIsSaveModalOpen(false); setEditingLibraryComponent(null); }}
          lang={lang}
          initialData={editingLibraryComponent}
          defaultName={lang === 'ja' ? '新規テンプレート' : 'New Template'}
          existingComponents={dbComponents}
          onSave={async (saveData) => {
            try {
              // If we are editing an existing component from the library modal, 
              // we use its existing data instead of the current canvas nodes/edges.
              const componentData = editingLibraryComponent ? editingLibraryComponent.data : { nodes, edges };

              const res = await fetch('/api/components', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: saveData.id || `comp_${Date.now()}`,
                  name: saveData.name,
                  description: saveData.description,
                  type: 'free',
                  isPrivate: saveData.isPrivate,
                  thumbnail: saveData.thumbnail,
                  data: componentData
                })
              });

              if (res.ok) {
                alert(lang === 'ja' ? 'ライブラリに保存しました。' : 'Saved to library.');
                setIsSaveModalOpen(false);
                refreshLibrary();
              } else {
                const errData = (await res.json()) as any;
                throw new Error(errData.details || 'Failed to save');
              }
            } catch (err) {
              console.error(err);
              alert((lang === 'ja' ? '保存に失敗しました: ' : 'Failed to save: ') + (err instanceof Error ? err.message : String(err)));
            }
          }}
        />
        <div
          style={{ flexGrow: 1, height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}
          ref={reactFlowWrapper}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          {/* Tabs Bar */}
          <div style={{
            height: '40px',
            background: '#f8f9fa',
            borderBottom: '1px solid #eee',
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
            gap: '4px'
          }}>
            {pages.map(page => (
              <div
                key={page.id}
                onClick={() => switchPage(page.id)}
                style={{
                  height: '32px',
                  padding: '0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  background: activePageId === page.id ? '#fff' : 'transparent',
                  border: activePageId === page.id ? '1px solid #eee' : '1px solid transparent',
                  borderBottom: 'none',
                  borderRadius: '6px 6px 0 0',
                  fontSize: '13px',
                  fontWeight: activePageId === page.id ? '600' : '400',
                  color: activePageId === page.id ? '#1a192b' : '#666',
                  cursor: 'pointer',
                  position: 'relative',
                  marginTop: '8px',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                {page.name}
                <X
                  size={14}
                  onClick={(e) => deletePage(e, page.id)}
                  style={{ opacity: 0.5, visibility: pages.length > 1 ? 'visible' : 'hidden' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
                />
              </div>
            ))}
            <button
              onClick={addPage}
              style={{
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: '#666',
                borderRadius: '4px',
                marginTop: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#eee'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <Plus size={18} />
            </button>
          </div>

          <div style={{ flexGrow: 1, height: '100%', position: 'relative' }}>
            {!isMounted ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>Loading Modeler...</div>
            ) : (
              <ReactFlow
                key="main-flow-mounted"
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              onNodeContextMenu={onNodeContextMenu}
              onNodeMouseEnter={onNodeMouseEnter}
              onNodeMouseMove={onNodeMouseMove}
              onNodeMouseLeave={onNodeMouseLeave}
              nodeTypes={nodeTypes}
              snapToGrid
              snapGrid={[10, 10]}
              elevateNodesOnSelect={false}
              elevateEdgesOnSelect={true}
              deleteKeyCode={['Backspace', 'Delete']}
              nodesDraggable={true}
              nodesConnectable={true}
              elementsSelectable={true}
              panOnScroll={false}
              zoomOnScroll={true}
              zoomOnPinch={true}
              nodesFocusable={true}
              edgesFocusable={true}
              selectNodesOnDrag={false}
            >
              <Controls showInteractive={false} />
              <Background variant={'dots' as any} gap={20} size={1} color="#e0e0e0" />
              {showGuide && (
                <Panel position="top-right" style={{ background: 'rgba(255,255,255,0.9)', padding: '16px', border: '1px solid #eee', borderRadius: '12px', fontSize: '13px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', backdropFilter: 'blur(12px)', maxWidth: '280px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ fontWeight: '800', color: '#1a192b' }}>{t.guideTitle}</div>
                    <button onClick={() => setShowGuide(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#999' }}>×</button>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#444', lineHeight: '1.6' }}>
                    <li>{t.guideDrag}</li>
                    <li>{t.guideConnect}</li>
                    <li><span style={{ fontWeight: 600 }}>Artifact:</span> {t.nodeArtifact}</li>
                    <li><span style={{ fontWeight: 600 }}>Context:</span> {t.nodeContext}</li>
                    <li><span style={{ fontWeight: 600 }}>Activity:</span> {t.nodeActivity}</li>
                  </ul>
                  <button onClick={handleNuclearReset} style={{ width: '100%', marginTop: '12px', padding: '8px', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>NUCLEAR RESET (FORCE UNLOCK)</button>
                  <div style={{ marginTop: '12px', fontSize: '10px', color: '#ccc', textAlign: 'right' }}>
                    Renders: {renderCount} | v2.2.6-CONTEXT_ISO_FIX
                  </div>
                </Panel>
              )}
            </ReactFlow>
            )}
          </div>
        </div>
        <PropertiesPanel
          nodes={nodes}
          node={selectedNode}
          selectedEdge={selectedEdge}
          onUpdate={updateNodeData}
          onUpdateEdge={updateEdgeData}
          onDeleteEdge={deleteEdge}
          onClose={() => setSelectedNodeId(null)}
          t={t}
          lang={lang}
          onSelectNode={setSelectedNodeId}
          isMember={isMember}
          isOperational={isOperational}
        />
      </div>
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        lang={lang}
      />
      {menu && (
        <ContextMenu
          onClose={() => setMenu(null)}
          onUpdate={updateNodeData}
          onDelete={deleteNode}
          t={t}
          lang={lang}
          showConfirm={showConfirm}
          {...menu}
        />
      )}
      {tooltip && (
        <Tooltip {...tooltip} />
      )}
      <input type="file" id="import-file" style={{ display: 'none' }} accept=".json" onChange={(e) => onImportFileChange(e, false)} />
      <input type="file" id="import-file-partial" style={{ display: 'none' }} accept=".json" onChange={(e) => onImportFileChange(e, true)} />

      <ComponentModal
        isOpen={isComponentModalOpen}
        onClose={() => setIsComponentModalOpen(false)}
        onSelect={handleSelectComponent}
        roles={roles}
        isOperational={isOperational}
        isMember={isMember}
        lang={lang}
        nodes={nodes}
        dbComponents={dbComponents}
        loading={isLibraryLoading}
        showConfirm={showConfirm}
        onDeleteComp={async (id) => {
          try {
            const res = await fetch(`/api/components?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
              alert(lang === 'ja' ? '削除しました。' : 'Deleted.');
              refreshLibrary();
            } else {
              const errData = await res.json() as any;
              throw new Error(errData.details || 'Failed to delete');
            }
          } catch (err) {
            console.error(err);
            alert((lang === 'ja' ? '削除に失敗しました: ' : 'Failed to delete: ') + (err instanceof Error ? err.message : String(err)));
          }
        }}
        onEditComp={(comp) => {
          setEditingLibraryComponent(comp);
          setIsSaveModalOpen(true);
        }}
        onLoadFullData={async (id) => {
          setIsLibraryLoading(true);
          const data = await fetchFullComponentData(id);
          setIsLibraryLoading(false);
          return data;
        }}
      />
    </div>
  );
});

export default function ABCApp() {
  return (
    <ReactFlowProvider>
      <DnDFlow />
    </ReactFlowProvider>
  );
}
