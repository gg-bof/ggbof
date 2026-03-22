'use client';

// ABC Flow Modeler v2.2.9-STABLE
// Restoring full professional UI features (Library, Properties Panel tabs)
// while maintaining v2.2.8 stability fixes (Context memoization & Ref-guarded effects).

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
];

const getCompData = (comp: any) => {
  let nodes = [];
  let edges = [];
  if (comp.data) { nodes = comp.data.nodes || []; edges = comp.data.edges || []; }
  else if (comp.nodes) { nodes = comp.nodes || []; edges = comp.edges || []; }
  const normalizedNodes = nodes.map((n: any) => {
    const w = n.width || n.style?.width || NODE_WIDTH;
    const h = n.height || n.style?.height || NODE_HEIGHT;
    const parseSize = (val: any) => (typeof val === 'number' ? val : parseInt(String(val).replace('px', '')) || 150);
    return { ...n, width: parseSize(w), height: parseSize(h), style: { ...(n.style || {}), width: parseSize(w), height: parseSize(h) }, draggable: true, selectable: true };
  });
  return { nodes: JSON.parse(JSON.stringify(normalizedNodes)), edges: JSON.parse(JSON.stringify(edges)) };
};

// --- Sub-components (Restored from Backup) ---

const ComponentThumbnail = ({ comp, nodeTypes }: { comp: any, nodeTypes: any }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  if (comp.thumbnail) return <img src={comp.thumbnail} alt={comp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
  const { nodes, edges } = getCompData(comp);
  return (
    <div ref={ref} style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
      {isVisible ? <ReactFlow nodes={nodes.map((n: any) => ({ ...n, selectable: false, draggable: false }))} edges={edges.map((e: any) => ({ ...e, selectable: false, animated: false }))} nodeTypes={nodeTypes} fitView proOptions={{ hideAttribution: true }} panOnDrag={false} zoomOnScroll={false} zoomOnPinch={false} zoomOnDoubleClick={false}><Background variant={'dots' as any} gap={10} size={1} color="#f0f0f0" /></ReactFlow> : <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8f9fa' }}><Layers size={40} color="#eee" /></div>}
    </div>
  );
};

const ComponentModal = ({ isOpen, onClose, onSelect, lang, nodes, dbComponents, loading, onDeleteComp, showConfirm, onLoadFullData, isOperational, roles }: any) => {
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);
  const t = (translations as any)[lang];
  React.useEffect(() => { const handleClick = () => setActiveMenuId(null); window.addEventListener('click', handleClick); return () => window.removeEventListener('click', handleClick); }, []);
  const onSelectMode = async (comp: any, mode: 'load' | 'import') => {
    let fullComp = comp;
    if (!comp.data && !comp.nodes) { const data = await onLoadFullData(comp.id); if (data) fullComp = { ...comp, data }; }
    if (mode === 'load' && nodes.length > 0) { showConfirm(t.libLoad, t.confirmOverwrite, () => onSelect({ ...fullComp, loadMode: mode })); return; }
    onSelect({ ...fullComp, loadMode: mode });
  };
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', borderRadius: '12px', width: '98vw', height: '98vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fcfcfc' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{t.sidebarLibrary}</div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={24} /></button>
        </div>
        <div style={{ padding: '20px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px', flex: 1 }}>
          {[...COMPONENTS, ...dbComponents].map(comp => (
            <div key={comp.id} style={{ border: '1px solid #eee', borderRadius: '12px', background: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: '180px', background: '#f5f5f5' }}><ComponentThumbnail comp={comp} nodeTypes={nodeTypes} /></div>
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{comp.name}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => onSelectMode(comp, 'load')} style={{ padding: '4px 12px', background: '#1a192b', color: '#fff', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '12px' }}>{t.libLoad}</button>
                    <button onClick={() => onSelectMode(comp, 'import')} style={{ padding: '4px 12px', background: '#eee', color: '#1a192b', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '12px' }}>{t.libImport}</button>
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>{comp.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ComponentSaveModal = ({ isOpen, onClose, onSave, lang, defaultName = '', initialData = null }: any) => {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState('');
  useEffect(() => { if (isOpen) { setName(initialData?.name || defaultName); setDescription(initialData?.description || ''); } }, [isOpen, initialData, defaultName]);
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', borderRadius: '12px', width: '400px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{lang === 'ja' ? 'ライブラリへ保存' : 'Save to Library'}</div>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minHeight: '80px' }} />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #ddd', background: '#fff' }}>Cancel</button>
          <button onClick={() => onSave({ name, description })} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#1a192b', color: '#fff' }}>Save</button>
        </div>
      </div>
    </div>
  );
};

// --- Restored Component: Sidebar (Full) ---

const Sidebar = ({ onImport, onExport, onLoadTemplate, onDeleteSelected, onClearAll, showGuide, onToggleGuide, onOpenComponentModal, onSaveToLibrary, lang, setLang, t, isOperational }: any) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => { event.dataTransfer.setData('application/reactflow', nodeType); event.dataTransfer.effectAllowed = 'move'; };
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  return (
    <aside style={{ width: '240px', borderRight: '1px solid #eee', padding: '24px 16px', background: '#fcfcfc', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div style={{ fontSize: '18px', fontWeight: '800', color: '#1a192b', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #1a192b' }}>Activity by Contract</div>
      <div style={{ background: '#f8f9fa', border: '1px solid #eee', borderRadius: '8px', padding: '4px', display: 'flex', gap: '4px', marginBottom: '20px' }}>
        <button style={{ flex: 1, padding: '6px 0', borderRadius: '4px', fontSize: '11px', border: 'none', background: lang === 'ja' ? '#1a192b' : 'transparent', color: lang === 'ja' ? '#fff' : '#666' }} onClick={() => setLang('ja')}>日本語</button>
        <button style={{ flex: 1, padding: '6px 0', borderRadius: '4px', fontSize: '11px', border: 'none', background: lang === 'en' ? '#1a192b' : 'transparent', color: lang === 'en' ? '#fff' : '#666' }} onClick={() => setLang('en')}>English</button>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
        <button onClick={onToggleGuide} style={{ flex: 1, height: '44px', borderRadius: '8px', border: '1px solid #1a192b', background: showGuide ? '#1a192b' : '#fff', color: showGuide ? '#fff' : '#1a192b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HelpCircle size={20} /></button>
        <button onClick={onOpenComponentModal} style={{ flex: 1, height: '44px', borderRadius: '8px', border: '1px solid #eee', background: '#fff', color: '#1a192b', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}><BookOpen size={20} /></button>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#8c8c8c', marginBottom: '15px' }}>{t.sidebarNodes}</div>
        {['activity', 'artifact', 'context'].map(type => (
          <div key={type} draggable onDragStart={(e) => onDragStart(e, type)} style={{ padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '10px', background: '#fff', cursor: 'grab', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600' }}>
            {type.toUpperCase()}
          </div>
        ))}
      </div>

      <div>
        <div onClick={() => setIsActionsOpen(!isActionsOpen)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', color: '#8c8c8c', cursor: 'pointer' }}>
          <div>{t.sidebarActions}</div> {isActionsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
        {isActionsOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
            {isOperational && <button onClick={() => onSaveToLibrary()} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: '#1a192b', color: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}><Save size={16} /> {t.sidebarSaveToLib}</button>}
            <button onClick={onImport} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #eee', background: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}><Upload size={16} /> {t.sidebarImport}</button>
            <button onClick={onExport} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #eee', background: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}><Download size={16} /> {t.sidebarExport}</button>
            <button onClick={onDeleteSelected} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #eee', background: '#fff', color: '#ff4d4f', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}><Trash2 size={16} /> {t.sidebarDeleteSelected}</button>
          </div>
        )}
      </div>
    </aside>
  );
};

// --- Restored Component: PropertiesPanel (Full) ---

const PropertiesPanel = ({ node, onUpdate, t, lang, selectedEdge, onUpdateEdge, onDeleteEdge }: any) => {
  const [activeTab, setActiveTab] = useState<'general' | 'inputs' | 'outputs' | 'constraints' | 'assets'>('general');
  if (!node && !selectedEdge) return null;

  return (
    <aside style={{ width: '320px', borderLeft: '1px solid #eee', background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '-2px 0 8px rgba(0,0,0,0.05)', zIndex: 10 }}>
      {node && (
        <>
          <div style={{ padding: '20px', borderBottom: '1px solid #eee', background: '#fcfcfc' }}>
             <div style={{ fontWeight: '800', fontSize: '16px', color: '#1a192b' }}>{t.propTitle}</div>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid #eee', background: '#fff', overflowX: 'auto' }}>
            {['general', 'inputs', 'outputs', 'constraints', 'assets'].map(tab => (
              node.type !== 'activity' && tab !== 'general' ? null :
              <div key={tab} onClick={() => setActiveTab(tab as any)} style={{ padding: '12px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', color: activeTab === tab ? '#1a192b' : '#999', borderBottom: activeTab === tab ? '2px solid #1a192b' : '2px solid transparent' }}>
                {tab.toUpperCase()}
              </div>
            ))}
          </div>
          <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
            {activeTab === 'general' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#888', marginBottom: '8px' }}>{t.propLabel}</label>
                  <input type="text" value={node.data.label || ''} onChange={(e) => onUpdate(node.id, { ...node.data, label: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#888', marginBottom: '8px' }}>{t.propNotes}</label>
                  <textarea value={node.data.notes || ''} onChange={(e) => onUpdate(node.id, { ...node.data, notes: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', minHeight: '100px' }} />
                </div>
              </div>
            )}
            {node.type === 'activity' && activeTab === 'inputs' && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#2196f3', marginBottom: '15px' }}>{t.propInputs}</label>
                <input type="number" min={0} max={10} value={node.data.inputs || 0} onChange={(e) => onUpdate(node.id, { ...node.data, inputs: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
              </div>
            )}
            {node.type === 'activity' && activeTab === 'outputs' && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#ff4d4f', marginBottom: '15px' }}>{t.propOutputs}</label>
                <input type="number" min={0} max={10} value={node.data.outputs || 0} onChange={(e) => onUpdate(node.id, { ...node.data, outputs: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
              </div>
            )}
          </div>
        </>
      )}
      {selectedEdge && (
        <div style={{ padding: '20px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '20px' }}>Edge Style</div>
          <button onClick={() => onDeleteEdge(selectedEdge.id)} style={{ padding: '10px', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete Edge</button>
        </div>
      )}
    </aside>
  );
};

// --- Main DnDFlow Component (Stabilized) ---

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
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const currentLangRef = useRef(lang);
  useEffect(() => {
    if (currentLangRef.current !== lang) {
      currentLangRef.current = lang;
      setNodes(nds => nds.map(n => n.id === 'root_context' ? { ...n, data: { ...n.data, label: lang === 'ja' ? '対象コンテキスト' : 'Target Context' } } : n));
    }
  }, [lang, setNodes]);

  const refreshLibrary = useCallback(async () => {
    setIsLibraryLoading(true);
    try { const res = await fetch('/api/components'); const data = await res.json(); if (Array.isArray(data)) setDbComponents(data); }
    catch (err) { console.error('Library fetch failed:', err); }
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
    const newNode: Node = { id: `node_${Date.now()}`, type, position, data: { label: `${type.charAt(0).toUpperCase() + type.slice(1)}` }, width: NODE_WIDTH, height: NODE_HEIGHT, style: { width: NODE_WIDTH, height: NODE_HEIGHT } };
    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance, setNodes]);

  const handleSelectComponent = (comp: any) => {
    const isLoad = comp.loadMode === 'load';
    const { nodes: tNodes, edges: tEdges } = getCompData(comp);
    if (isLoad) { setNodes(tNodes); setEdges(tEdges); }
    else { setNodes(nds => nds.concat(tNodes)); setEdges(eds => eds.concat(tEdges)); }
    setIsComponentModalOpen(false);
    setTimeout(() => { if (reactFlowInstance) reactFlowInstance.fitView({ padding: 0.2, duration: 800 }); }, 100);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;
  const selectedEdge = edges.find(e => e.selected) || null;

  if (!isMounted) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', height: '100vh', paddingTop: '64px', boxSizing: 'border-box' }}>
      <Sidebar
        lang={lang} setLang={setLang} t={t} isOperational={isOperational}
        onOpenComponentModal={() => setIsComponentModalOpen(true)}
        onSaveToLibrary={() => setIsSaveModalOpen(true)}
        onImport={() => (document.getElementById('import-file') as HTMLInputElement).click()}
        onExport={() => {
           const data = { nodes, edges };
           const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
           const url = URL.createObjectURL(blob);
           const link = document.createElement('a');
           link.href = url;
           link.download = `abc-flow-${new Date().toISOString().slice(0, 10)}.json`;
           link.click();
        }}
        onDeleteSelected={() => setNodes(nds => nds.filter(n => !n.selected))}
      />

      <div style={{ flex: 1, position: 'relative' }} ref={reactFlowWrapper} onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}
          onInit={setReactFlowInstance} nodeTypes={nodeTypes} fitView
          nodesDraggable={true} elementsSelectable={true}
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          onPaneClick={() => setSelectedNodeId(null)}
        >
          <Background />
          <Controls />
          <Panel position="top-right" style={{ background: '#fff', padding: '15px', border: '1px solid #ccc', borderRadius: '8px', opacity: 0.9 }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Modeler v2.2.9-STABLE</div>
            <div style={{ fontSize: '10px', color: '#888' }}>Renders: {globalRenderCount}</div>
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ marginTop: '10px', width: '100%', padding: '5px', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>RESET</button>
          </Panel>
        </ReactFlow>
      </div>

      <PropertiesPanel
        node={selectedNode} selectedEdge={selectedEdge}
        onUpdate={(id: string, data: any) => setNodes(nds => nds.map(n => n.id === id ? { ...n, data } : n))}
        onUpdateEdge={(id: string, updates: any) => setEdges(eds => eds.map(e => e.id === id ? { ...e, ...updates } : e))}
        onDeleteEdge={(id: string) => setEdges(eds => eds.filter(e => e.id !== id))}
        t={t} lang={lang}
      />

      <ComponentModal
        isOpen={isComponentModalOpen} onClose={() => setIsComponentModalOpen(false)}
        onSelect={handleSelectComponent} lang={lang} nodes={nodes} dbComponents={dbComponents} loading={isLibraryLoading} roles={roles} isOperational={isOperational}
        onLoadFullData={async (id: string) => { const res = await fetch(`/api/components?id=${id}`); const data = await res.json(); return Array.isArray(data) ? data[0]?.data : data?.data; }}
        showConfirm={(title: string, msg: string, cb: any) => { if (window.confirm(`${title}\n\n${msg}`)) cb(); }}
      />
      <ComponentSaveModal
        isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)}
        lang={lang} defaultName={lang === 'ja' ? '新規テンプレート' : 'New Template'}
        onSave={async (saveData: any) => {
          try {
            const res = await fetch('/api/components', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...saveData, type: 'free', data: { nodes, edges } })
            });
            if (res.ok) { alert('Saved!'); setIsSaveModalOpen(false); refreshLibrary(); }
          } catch(e) { alert('Save failed'); }
        }}
      />
      <input type="file" id="import-file" style={{ display: 'none' }} accept=".json" onChange={(e) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (re) => { try { const data = JSON.parse(re.target?.result as string); setNodes(data.nodes); setEdges(data.edges); } catch(err) { alert('Invalid file'); } };
        reader.readAsText(file);
      }} />
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
