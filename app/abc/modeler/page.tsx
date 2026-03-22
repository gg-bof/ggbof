'use client';

// ABC Flow Modeler v2.2.8-STABLE_RESTORE
// This version restores all features but fixes the infinite re-render loop
// identified in v2.2.6.

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
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
  
  return { 
    nodes: JSON.parse(JSON.stringify(normalizedNodes)), 
    edges: JSON.parse(JSON.stringify(edges)) 
  };
};

const ComponentThumbnail = ({ comp, nodeTypes }: { comp: any, nodeTypes: any }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  if (comp.thumbnail) {
    return <img src={comp.thumbnail} alt={comp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
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
        padding: '8px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '8px',
        cursor: 'pointer', background: '#fff', transition: 'all 0.2s',
        display: 'flex', alignItems: 'center', gap: '10px'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#eee'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ width: '44px', height: '44px', borderRadius: '6px', overflow: 'hidden', background: '#f8f9fa', flexShrink: 0, border: '1px solid #f0f0f0' }}>
        {comp.thumbnail ? <img src={comp.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#eee' }}><Layers size={20} /></div>}
      </div>
      <div style={{ fontSize: '11px', fontWeight: '700', color: '#1a192b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{comp.name}</div>
    </div>
  );
};

const ComponentModal = ({
  isOpen, onClose, onSelect, roles, isOperational, isMember, lang, nodes, onEditComp, dbComponents, loading, onDeleteComp, showConfirm, onLoadFullData
}: any) => {
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);
  const t = (translations as any)[lang];

  React.useEffect(() => {
    const handleClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const onSelectMode = async (comp: any, mode: 'load' | 'import') => {
    let fullComp = comp;
    if (!comp.data && !comp.nodes) {
      const data = await onLoadFullData(comp.id);
      if (data) fullComp = { ...comp, data };
    }
    if (mode === 'load' && nodes.length > 0) {
      showConfirm(t.libLoad, t.confirmOverwrite, () => onSelect({ ...fullComp, loadMode: mode }));
      return;
    }
    onSelect({ ...fullComp, loadMode: mode });
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', borderRadius: '12px', width: '98vw', height: '98vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fcfcfc' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a192b' }}>{t.sidebarLibrary}</div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#999' }}><X size={24} /></button>
        </div>
        <div style={{ padding: '20px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px', flex: 1 }}>
          {loading ? <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px' }}>Loading...</div> : 
            [...COMPONENTS, ...dbComponents.filter((dc: any) => !COMPONENTS.some(sc => sc.id === dc.id))].map(comp => (
              <div key={comp.id} style={{ border: '1px solid #eee', borderRadius: '12px', background: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ height: '180px', background: '#f5f5f5' }}><ComponentThumbnail comp={comp} nodeTypes={nodeTypes} /></div>
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{comp.name}</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                       <button onClick={(e) => { e.stopPropagation(); onSelectMode(comp, 'load'); }} style={{ padding: '4px 12px', background: '#1a192b', color: '#fff', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '12px' }}>{t.libLoad}</button>
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>{comp.description}</div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

const INITIAL_ROOT_NODE: Node = {
  id: 'root_context',
  type: 'context',
  position: { x: 0, y: 0 },
  data: { label: '対象コンテキスト', isRoot: true },
  style: { width: 1200, height: 800 },
  width: 1200, height: 800, zIndex: 0, draggable: true,
};

let globalRenderCount = 0;

const DnDFlow = React.memo(() => {
  globalRenderCount++;
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { lang, setLang, isMember, isOperational, roles } = useLanguage();
  const t = (translations as any)[lang];

  const [nodes, setNodes, onNodesChange] = useNodesState([INITIAL_ROOT_NODE]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [dbComponents, setDbComponents] = useState<any[]>([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  // Stabilized Root Label Sync - only trigger on actual language value change
  const currentLangRef = useRef(lang);
  useEffect(() => {
    if (currentLangRef.current !== lang) {
      currentLangRef.current = lang;
      setNodes(nds => nds.map(n => 
        n.id === 'root_context' 
          ? { ...n, data: { ...n.data, label: lang === 'ja' ? '対象コンテキスト' : 'Target Context' } } 
          : n
      ));
    }
  }, [lang, setNodes]);

  const refreshLibrary = useCallback(async () => {
    setIsLibraryLoading(true);
    try {
      const res = await fetch('/api/components');
      const data = await res.json();
      if (Array.isArray(data)) setDbComponents(data);
    } catch (err) { console.error('Library fetch failed:', err); }
    finally { setIsLibraryLoading(false); }
  }, []);

  useEffect(() => { if (isMounted) refreshLibrary(); }, [isMounted, refreshLibrary]);

  const onConnect = useCallback((params: Connection | Edge) => {
    setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#1a192b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#1a192b' } }, eds));
  }, [setEdges]);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!reactFlowInstance) return;
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;
    const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const newNode: Node = {
      id: `node_${Date.now()}`, type, position,
      data: { label: `${type.charAt(0).toUpperCase() + type.slice(1)}` },
      width: NODE_WIDTH, height: NODE_HEIGHT, style: { width: NODE_WIDTH, height: NODE_HEIGHT },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance, setNodes]);

  if (!isMounted) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', height: '100vh', paddingTop: '64px', boxSizing: 'border-box' }}>
      <aside style={{ width: '240px', borderRight: '1px solid #eee', padding: '20px', background: '#fcfcfc', overflowY: 'auto' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '20px', borderBottom: '2px solid #1a192b', paddingBottom: '10px' }}>Activity by Contract</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '20px' }}>
          <button style={{ padding: '5px', background: lang === 'ja' ? '#1a192b' : '#eee', color: lang === 'ja' ? '#fff' : '#000' }} onClick={() => setLang('ja')}>JA</button>
          <button style={{ padding: '5px', background: lang === 'en' ? '#1a192b' : '#eee', color: lang === 'en' ? '#fff' : '#000' }} onClick={() => setLang('en')}>EN</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {['activity', 'artifact', 'context'].map(type => (
            <div key={type} draggable onDragStart={(e) => { e.dataTransfer.setData('application/reactflow', type); }} style={{ padding: '10px', border: '1px solid #ddd', background: '#fff', borderRadius: '4px', cursor: 'grab', textAlign: 'center', fontSize: '12px' }}>
              {type.toUpperCase()}
            </div>
          ))}
          <button onClick={() => setNodes(nds => nds.filter(n => !n.selected))} style={{ marginTop: '20px', padding: '10px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer' }}>{t.sidebarDeleteSelected}</button>
        </div>
      </aside>

      <div style={{ flex: 1, position: 'relative' }} ref={reactFlowWrapper} onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}
          onInit={setReactFlowInstance} nodeTypes={nodeTypes} fitView
          nodesDraggable={true} elementsSelectable={true}
        >
          <Background />
          <Controls />
          <Panel position="top-right" style={{ background: '#fff', padding: '15px', border: '1px solid #ccc', borderRadius: '8px', opacity: 0.9 }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Modeler v2.2.8-STABLE</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Renders: {globalRenderCount}</div>
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ marginTop: '10px', width: '100%', padding: '5px', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>RESET</button>
          </Panel>
        </ReactFlow>
      </div>
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
