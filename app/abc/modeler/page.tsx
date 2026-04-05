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
  ConnectionMode,
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
  Play, CheckCircle, Info, Shield, Key, Heart, MessageSquare, Sparkles,
  FilePlus, Image as ImageIcon
} from 'lucide-react';
import { toPng } from 'html-to-image';
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
    authorName: 'Antigravity',
    category: 'artifact',
    // thumbnail: '/thumbnails/basic.png',
    nodes: [
      { id: 'root_context', type: 'context', position: { x: 0, y: 0 }, data: { label: '基本フロー', isRoot: true, notes: '基本となる入出力と処理のフローです。' }, style: { width: 800, height: 300 }, width: 800, height: 300, zIndex: 0 },
      { id: 't1_art1', type: 'artifact', parentId: 'root_context', position: { x: 50, y: 100 }, data: { label: '入力書類', notes: '業務プロセスの開始点となる物理的または電子的な書類です。内容の整合性が確認されている必要があります。' }, width: NODE_WIDTH, height: NODE_HEIGHT, style: { width: NODE_WIDTH, height: NODE_HEIGHT }, extent: 'parent' as const },
      { id: 't1_act1', type: 'activity', parentId: 'root_context', position: { x: 300, y: 100 }, data: { label: '処理プロセス', inputs: 1, outputs: 1, constraints: 1, assets: 1, notes: '入力書類の内容に基づき、規定のルールに従ってデータの変換や加筆を行います。', handleData: { 'in-0': { name: '要件', description: '入力の妥当性および処理に必要なメタデータ' }, 'out-0': { name: '成果物', description: '処理済みの構造化データ' }, 'constraint-0': { name: '処理規則', description: '標準作業手順書(SOP)など' }, 'asset-0': { name: '担当者', description: '業務実行者' } } }, width: NODE_WIDTH, height: NODE_HEIGHT, style: { width: NODE_WIDTH, height: NODE_HEIGHT }, extent: 'parent' as const },
      { id: 't1_art2', type: 'artifact', parentId: 'root_context', position: { x: 550, y: 100 }, data: { label: '出力成果物', notes: 'プロセスによって生成された最終結果です。後続の工程や保管の対象となります。' }, width: NODE_WIDTH, height: NODE_HEIGHT, style: { width: NODE_WIDTH, height: NODE_HEIGHT }, extent: 'parent' as const },
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
    authorName: 'Antigravity',
    category: 'situation',
    thumbnail: '/thumbnails/feedback.png',
    nodes: [
      { id: 'root_context', type: 'context', position: { x: 0, y: 0 }, data: { label: '承認・フィードバック', isRoot: true, notes: '案件の審査と結果の通知を行う状況です。' }, style: { width: 800, height: 450 }, width: 800, height: 450, zIndex: 0 },
      { id: 't2_art1', type: 'artifact', parentId: 'root_context', position: { x: 50, y: 150 }, data: { label: '課題', notes: '解決すべき問題点や、審査のトリガーとなる案件情報です。' }, width: NODE_WIDTH, height: NODE_HEIGHT, style: { width: NODE_WIDTH, height: NODE_HEIGHT }, extent: 'parent' as const },
      { id: 't2_act1', type: 'activity', parentId: 'root_context', position: { x: 250, y: 150 }, data: { label: '審査', inputs: 1, outputs: 1, constraints: 1, assets: 1, notes: '品質基準およびコンプライアンスに基づき、案件の採否を決定します。', handleData: { 'in-0': { name: '申請', description: '審査対象の証跡および申請書' }, 'out-0': { name: '審査結果', description: '審査完了後の判定データ' }, 'constraint-0': { name: '承認基準', description: '承認に必要なスコアや条件' }, 'asset-0': { name: '審査官', description: '判定を行う責任者' } } }, width: NODE_WIDTH, height: NODE_HEIGHT, style: { width: NODE_WIDTH, height: NODE_HEIGHT }, extent: 'parent' as const },
      { id: 't2_gate1', type: 'gate', parentId: 'root_context', position: { x: 450, y: 150 }, data: { label: '審査結果分岐', notes: '審査結果に基づき、承認または差し戻しのルートを決定します。', handleData: { 'out-0': { name: '承認', description: '合格。次工程への進行許可' }, 'out-1': { name: '差し戻し', description: '不備あり。修正箇所の指摘事項' } } }, width: NODE_WIDTH, height: NODE_HEIGHT, style: { width: NODE_WIDTH, height: NODE_HEIGHT }, extent: 'parent' as const },
      { id: 't2_art_ok', type: 'artifact', parentId: 'root_context', position: { x: 650, y: 50 }, data: { label: '承認済書類', notes: '審査を通過し、正式に受領された状態のドキュメントです。' }, width: NODE_WIDTH, height: NODE_HEIGHT, style: { width: NODE_WIDTH, height: NODE_HEIGHT }, extent: 'parent' as const },
      { id: 't2_art_ng', type: 'artifact', parentId: 'root_context', position: { x: 650, y: 250 }, data: { label: '修正依頼', notes: '差し戻し理由と改善要求が記載された通知です。' }, width: NODE_WIDTH, height: NODE_HEIGHT, style: { width: NODE_WIDTH, height: NODE_HEIGHT }, extent: 'parent' as const },
    ],
    edges: [
      { id: 'e2-1', source: 't2_art1', target: 't2_act1', targetHandle: 'in-0', animated: true, style: { stroke: '#1a192b', strokeWidth: 2 } },
      { id: 'e2-2', source: 't2_act1', sourceHandle: 'out-0', target: 't2_gate1', animated: true, style: { stroke: '#1a192b', strokeWidth: 2 } },
      { id: 'e2-3', source: 't2_gate1', sourceHandle: 'out-0', target: 't2_art_ok', animated: true, style: { stroke: '#1a192b', strokeWidth: 2 } },
      { id: 'e2-4', source: 't2_gate1', sourceHandle: 'out-1', target: 't2_art_ng', animated: true, style: { stroke: '#1a192b', strokeWidth: 2 } },
    ]
  },
  {
    id: 'contract',
    name: '契約締結プロセス',
    type: 'paid',
    isPrivate: false,
    authorName: 'Antigravity',
    category: 'situation',
    thumbnail: '/thumbnails/contract.png',
    nodes: [
      { id: 'root_context', type: 'context', position: { x: 0, y: 0 }, data: { label: '契約締結プロセス', isRoot: true, notes: '法的・財務的リスクを管理しながら契約を締結するフローです。' }, style: { width: 800, height: 450 }, width: 800, height: 450, zIndex: 0 },
      { id: 'p1_art1', type: 'artifact', parentId: 'root_context', position: { x: 50, y: 150 }, data: { label: '契約依頼', notes: '取引先との合意が必要な事項の草案です。' }, width: NODE_WIDTH, height: NODE_HEIGHT, style: { width: NODE_WIDTH, height: NODE_HEIGHT }, extent: 'parent' as const },
      { id: 'p1_act1', type: 'activity', parentId: 'root_context', position: { x: 250, y: 150 }, data: { label: '契約審査', inputs: 1, outputs: 1, notes: 'リーガルおよび財務の観点から契約リスクを評価します。', handleData: { 'in-0': { name: '依頼', description: '契約条項の原案および背景情報' }, 'out-0': { name: '審査完了', description: '評価済みの契約データ' } } }, width: NODE_WIDTH, height: NODE_HEIGHT, style: { width: NODE_WIDTH, height: NODE_HEIGHT }, extent: 'parent' as const },
      { id: 'p1_gate1', type: 'gate', parentId: 'root_context', position: { x: 450, y: 150 }, data: { label: '締結判断', notes: '法的・財務的リスクに基づき、締結可否を判断します。', handleData: { 'out-0': { name: '承認', description: '法的リスクなし。締結フェーズへ' }, 'out-1': { name: '修正要求', description: 'リスク指摘および推奨される修正文言' } } }, width: NODE_WIDTH, height: NODE_HEIGHT, style: { width: NODE_WIDTH, height: NODE_HEIGHT }, extent: 'parent' as const },
      { id: 'p1_art2', type: 'artifact', parentId: 'root_context', position: { x: 650, y: 50 }, data: { label: '締結可能契約', notes: '双方が合意し、署名・捺印の準備が整った契約書です。' }, width: NODE_WIDTH, height: NODE_HEIGHT, style: { width: NODE_WIDTH, height: NODE_HEIGHT }, extent: 'parent' as const },
      { id: 'p1_art3', type: 'artifact', parentId: 'root_context', position: { x: 650, y: 250 }, data: { label: '再編集依頼', notes: '条件不一致やリスクにより再交渉・修正が必要な案件です。' }, width: NODE_WIDTH, height: NODE_HEIGHT, style: { width: NODE_WIDTH, height: NODE_HEIGHT }, extent: 'parent' as const },
    ],
    edges: [
      { id: 'pe1-1', source: 'p1_art1', target: 'p1_act1', targetHandle: 'in-0', animated: true, style: { stroke: '#1a192b', strokeWidth: 2 } },
      { id: 'pe1-2', source: 'p1_act1', sourceHandle: 'out-0', target: 'p1_gate1', animated: true, style: { stroke: '#1a192b', strokeWidth: 2 } },
      { id: 'pe1-3', source: 'p1_gate1', sourceHandle: 'out-0', target: 'p1_art2', animated: true, style: { stroke: '#1a192b', strokeWidth: 2 } },
      { id: 'pe1-4', source: 'p1_gate1', sourceHandle: 'out-1', target: 'p1_art3', animated: true, style: { stroke: '#1a192b', strokeWidth: 2 } },
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
    // Explicitly destructure data to ensure no properties like notes or handleData are lost during normalization
    const { data, ...rest } = n;
    const isAntigravity = comp.authorName === 'Antigravity';
    return { 
      ...rest,
      data: { 
        ...data,
        label: data.label || 'Unnamed',
        notes: data.notes || (isAntigravity ? 'Draft: System template documentation' : '') 
      }, // Ensure data is preserved deep-enough
      width: parseSize(w), 
      height: parseSize(h), 
      style: { ...(n.style || {}), width: parseSize(w), height: parseSize(h) }, 
      draggable: true, 
      selectable: true 
    };
  });
  return { nodes: JSON.parse(JSON.stringify(normalizedNodes)), edges: JSON.parse(JSON.stringify(edges)) };
};

// --- Sub-components (Restored from Backup) ---

// --- Accuracy Helpers ---
const getEdgePathThumbnail = (sx: number, sy: number, tx: number, ty: number, type: string) => {
  if (type === 'straight') return `M ${sx} ${sy} L ${tx} ${ty}`;
  if (type === 'step' || type === 'smoothstep') {
    const midX = (sx + tx) / 2;
    return `M ${sx} ${sy} L ${midX} ${sy} L ${midX} ${ty} L ${tx} ${ty}`;
  }
  // Default: Cubic Bezier (Curved)
  const offset = Math.max(Math.abs(tx - sx) / 2, 20);
  return `M ${sx} ${sy} C ${sx + offset} ${sy}, ${tx - offset} ${ty}, ${tx} ${ty}`;
};

const ComponentThumbnail = ({ comp }: { comp: any }) => {
  if (comp.thumbnail) {
    return <img src={comp.thumbnail} alt={comp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
  }

  let nodes = [];
  let edges = [];
  
  if (comp.nodes) {
    nodes = comp.nodes;
    edges = comp.edges || [];
  } else {
    const data = typeof comp.data === 'string' ? JSON.parse(comp.data) : (comp.data || {});
    nodes = data.nodes || [];
    edges = data.edges || [];
  }

  if (nodes.length === 0) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', background: '#f9f9f9' }}>
        <Layers size={48} opacity={0.2} />
      </div>
    );
  }

  // Pre-calculate world positions for nested nodes (Recursive helper)
  const getWorldPos = (node: any, allNodes: any[]): { x: number, y: number } => {
    let x = node.position.x;
    let y = node.position.y;
    let pid = node.parentId;
    while (pid) {
      const p = allNodes.find(n => n.id === pid);
      if (p) { x += p.position.x; y += p.position.y; pid = p.parentId; }
      else break;
    }
    return { x, y };
  };

  const worldNodes = nodes.map((n: any) => ({ ...n, ...getWorldPos(n, nodes) }));

  // Calculate bounding box using world positions
  const padding = 20;
  let minX = worldNodes[0].x;
  let minY = worldNodes[0].y;
  let maxX = worldNodes[0].x + (worldNodes[0].width || 150);
  let maxY = worldNodes[0].y + (worldNodes[0].height || 80);

  worldNodes.forEach((n: any) => {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + (n.width || 150));
    maxY = Math.max(maxY, n.y + (n.height || 80));
  });

  const contentW = maxX - minX;
  const contentH = maxY - minY;
  const containerW = 400; // Library card area width
  const containerH = 200; // Library card height
  
  const scale = Math.min((containerW - padding * 2) / contentW, (containerH - padding * 2) / contentH, 1);
  const offsetX = (containerW - contentW * scale) / 2 - minX * scale;
  const offsetY = (containerH - contentH * scale) / 2 - minY * scale;

  return (
    <div style={{ width: '100%', height: '100%', background: '#fff', position: 'relative', overflow: 'hidden' }}>
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>
        
        {/* Edges */}
        {edges.map((e: any, i: number) => {
          const s = worldNodes.find((n: any) => n.id === e.source);
          const t = worldNodes.find((n: any) => n.id === e.target);
          if (!s || !t) return null;
          
          const sx = s.x * scale + offsetX + (s.width || 150) * scale / 2;
          const sy = s.y * scale + offsetY + (s.height || 80) * scale / 2;
          const tx = t.x * scale + offsetX + (t.width || 150) * scale / 2;
          const ty = t.y * scale + offsetY + (t.height || 80) * scale / 2;

          return (
            <path 
              key={i}
              d={getEdgePathThumbnail(sx, sy, tx, ty, e.type || 'default')}
              fill="none"
              stroke={e.style?.stroke || "#cbd5e1"}
              strokeWidth={(e.style?.strokeWidth || 2) * scale}
              strokeDasharray={e.style?.strokeDasharray ? (e.style.strokeDasharray.split(',').map((v: string) => parseFloat(v) * scale).join(',')) : (e.animated ? "5,5" : undefined)}
              markerEnd="url(#arrow)"
              opacity={0.6}
            />
          );
        })}
      </svg>
      
        {/* Nodes */}
        {worldNodes.map((n: any) => {
          const type = n.type || 'activity';
          const data = n.data || {};
          let borderColor = '#1a192b';
          let bgColor = data.color || '#fff';
          let clipPath = 'none';
          let borderRadius = Math.max(2, 8 * scale) + 'px';
          let iconColor = '#4f46e5';
          let borderStyle = `2px solid ${borderColor}`;

          if (type === 'context') {
            borderColor = data.isRoot ? '#cbd5e1' : '#3b82f6';
            bgColor = data.color || 'rgba(239, 246, 255, 0.4)';
            borderRadius = '8px';
            borderStyle = `2px ${data.isRoot ? 'dashed' : 'solid'} ${borderColor}`;
            iconColor = '#3b82f6';
          } else if (type === 'artifact') {
            borderColor = '#2196f3';
            bgColor = data.color || 'rgba(255,255,255,0.9)';
            clipPath = 'polygon(10% 0%, 90% 0%, 100% 15%, 100% 85%, 90% 100%, 10% 100%, 0% 85%, 0% 15%)';
            borderRadius = '0';
            iconColor = '#2196f3';
            borderStyle = 'none';
          } else if (type === 'gate') {
            borderColor = '#1a192b';
            bgColor = data.color || '#fff';
            clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
            borderRadius = '0';
            iconColor = '#1a192b';
            borderStyle = 'none';
          } else if (type === 'comment') {
            borderColor = '#9c27b0';
            bgColor = 'transparent';
            borderRadius = '0';
            iconColor = '#9c27b0';
            borderStyle = `1px dashed ${borderColor}`;
          }
          
          const w = (n.width || 150) * scale;
          const h = (n.height || 80) * scale;
          const iPos = data.iconPosition || 'center';
          
          return (
            <div key={n.id} style={{
              position: 'absolute',
              left: n.x * scale + offsetX,
              top: n.y * scale + offsetY,
              width: w,
              height: h,
              background: bgColor,
              borderRadius,
              clipPath,
              border: borderStyle,
              borderColor,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'visible',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              zIndex: type === 'context' ? 1 : 2
            }}>
              {clipPath !== 'none' && (
                 <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                   {type === 'artifact' && <polygon points="10,0 90,0 100,15 100,85 90,100 10,100 0,85 0,15" fill="none" stroke={borderColor} strokeWidth="3" vectorEffect="non-scaling-stroke" />}
                   {type === 'gate' && <polygon points="50,0 100,50 50,100 0,50" fill="none" stroke={borderColor} strokeWidth="2" vectorEffect="non-scaling-stroke" />}
                 </svg>
              )}

              <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {data.icon && iPos !== 'center' && (
                  <div style={{
                    position: 'absolute',
                    top: iPos.includes('top') ? '2px' : 'auto',
                    bottom: iPos.includes('bottom') ? '2px' : 'auto',
                    left: iPos.includes('left') ? '2px' : 'auto',
                    right: iPos.includes('right') ? '2px' : 'auto',
                    zIndex: 10
                  }}>
                    <NodeIcon iconName={data.icon} size={Math.min(w, h) * 0.3} color={iconColor} />
                  </div>
                )}
                
                {data.icon && iPos === 'center' && (
                  <NodeIcon iconName={data.icon} size={Math.min(w, h) * 0.4} color={iconColor} />
                )}
                
                {scale > 0.5 && data.label && (
                  <div style={{ 
                    fontSize: Math.max(6, 12 * scale) + 'px', 
                    fontWeight: 'bold', color: '#1a192b',
                    maxWidth: '90%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    textAlign: 'center'
                  }}>
                    {data.label}
                  </div>
                )}
              </div>
              
              {scale > 0.3 && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  {Array.from({ length: data.inputs || (type === 'activity' ? 1 : 0) }).map((_, i, arr) => {
                    const top = (h / (arr.length + 1)) * (i + 1);
                    return <div key={`in-${i}`} style={{ position: 'absolute', left: '-2px', top, transform: 'translateY(-50%)', width: '4px', height: '4px', background: '#3b82f6', borderRadius: '50%', border: '1px solid #fff' }} />;
                  })}
                  {Array.from({ length: data.outputs || (type === 'activity' ? 1 : 0) }).map((_, i, arr) => {
                    const top = (h / (arr.length + 1)) * (i + 1);
                    return <div key={`out-${i}`} style={{ position: 'absolute', right: '-2px', top, transform: 'translateY(-50%)', width: '4px', height: '4px', background: '#f43f5e', borderRadius: '0', clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)', border: 'none' }} />;
                  })}
                  {Array.from({ length: data.constraints || 0 }).map((_, i, arr) => {
                    const left = (w / (arr.length + 1)) * (i + 1);
                    return <div key={`con-${i}`} style={{ position: 'absolute', top: '-2px', left, transform: 'translateX(-50%)', width: '4px', height: '4px', background: '#10b981', borderRadius: '0', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />;
                  })}
                  {Array.from({ length: data.assets || 0 }).map((_, i, arr) => {
                    const left = (w / (arr.length + 1)) * (i + 1);
                    return <div key={`ast-${i}`} style={{ position: 'absolute', bottom: '-2px', left, transform: 'translateX(-50%)', width: '4px', height: '4px', background: '#f59e0b', borderRadius: '0', clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }} />;
                  })}
                </div>
              )}

              {data.bgImage && <div style={{ position: 'absolute', inset: 0, background: `url(${data.bgImage})`, backgroundSize: 'cover', opacity: 0.1, zIndex: -1 }} />}
            </div>
          );
        })}
    </div>
  );
};



const ComponentModal = React.memo(({ isOpen, onClose, onSelect, lang, nodes, dbComponents, loading, onDeleteComp, onEditAttr, showConfirm, onLoadFullData, isOperational, isMember, roles }: any) => {
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'artifact' | 'situation'>('artifact');
  const t = (translations as any)[lang];
  React.useEffect(() => { const handleClick = () => setActiveMenuId(null); window.addEventListener('click', handleClick); return () => window.removeEventListener('click', handleClick); }, []);
  const onSelectMode = async (comp: any, mode: 'load' | 'import') => {
    let fullComp = comp;
    if (!comp.data && !comp.nodes) { const data = await onLoadFullData(comp.id); if (data) fullComp = { ...comp, data }; }
    if (mode === 'load' && nodes.length > 0) { showConfirm(t.libLoad, t.confirmOverwrite, () => onSelect({ ...fullComp, loadMode: mode })); return; }
    onSelect({ ...fullComp, loadMode: mode });
  };
  if (!isOpen) return null;

  const filteredComponents = Array.from(new Map([...dbComponents, ...COMPONENTS].map(c => [c.id, c])).values())
    .filter(comp => {
      const cat = comp.category || 'artifact';
      return cat === activeTab;
    });

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', borderRadius: '12px', width: '98vw', height: '98vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fcfcfc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{t.sidebarLibrary}</div>
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', gap: '4px' }}>
              <button 
                onClick={() => setActiveTab('artifact')}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: activeTab === 'artifact' ? 'bold' : '500',
                  background: activeTab === 'artifact' ? '#fff' : 'transparent',
                  color: activeTab === 'artifact' ? '#1a192b' : '#64748b',
                  boxShadow: activeTab === 'artifact' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {t.libTabArtifact}
              </button>
              <button 
                onClick={() => setActiveTab('situation')}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: activeTab === 'situation' ? 'bold' : '500',
                  background: activeTab === 'situation' ? '#fff' : 'transparent',
                  color: activeTab === 'situation' ? '#1a192b' : '#64748b',
                  boxShadow: activeTab === 'situation' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {t.libTabContext}
              </button>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={24} /></button>
        </div>
        <div style={{ padding: '20px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px', flex: 1, alignContent: 'start', alignItems: 'start' }}>
          {filteredComponents.map(comp => {
            const isSystemComp = ['basic', 'feedback', 'contract'].includes(comp.id);
            const authorName = isSystemComp ? 'Antigravity' : comp.authorName;
            const isAntigravity = authorName === 'Antigravity';
            const isCustomThumb = comp.thumbnail && (comp.thumbnail.startsWith('http') || comp.thumbnail.startsWith('/'));
            return (
              <div 
                key={comp.id} 
                onClick={() => onSelectMode(comp, 'load')}
                style={{ 
                  border: '1px solid #eee', 
                  borderRadius: '12px', 
                  background: '#fff', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  overflow: 'hidden', 
                  position: 'relative', 
                  transition: 'all 0.2s', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 20px -5px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = '#4f46e5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  e.currentTarget.style.borderColor = '#eee';
                }}
              >
                <div style={{ height: '180px', background: '#f8fafc', position: 'relative' }}>
                  {isCustomThumb ? (
                    <img src={comp.thumbnail} alt={comp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <ComponentThumbnail comp={comp} />
                  )}
                  {comp.type === 'paid' && (
                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(255,215,0,0.9)', color: '#000', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Zap size={10} fill="currentColor" /> PREMIUM
                    </div>
                  )}
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '800', fontSize: '17px', color: '#1a192b', marginBottom: '4px' }}>{comp.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {comp.authorAvatar ? (
                          <img src={comp.authorAvatar} alt={authorName} style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
                        ) : (
                          <div style={{ 
                            width: '18px', 
                            height: '18px', 
                            borderRadius: '50%', 
                            background: isAntigravity ? '#4f46e5' : '#e2e8f0', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}>
                            {isAntigravity ? (
                              <Zap size={10} color="#fff" fill="#fff" />
                            ) : (
                              <User size={10} color="#64748b" />
                            )}
                          </div>
                        )}
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{authorName || 'Anonymous'}</span>
                        {isAntigravity && <Sparkles size={10} color="#4f46e5" />}
                      </div>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === comp.id ? null : comp.id); }} 
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', borderRadius: '6px', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      >
                        <MoreVertical size={20} color="#64748b" />
                      </button>
                      {activeMenuId === comp.id && (
                        <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)', borderRadius: '10px', zIndex: 1200, padding: '6px', minWidth: '160px', border: '1px solid #f1f5f9' }}>
                          <button onClick={() => { onSelectMode(comp, 'load'); setActiveMenuId(null); }} style={{ width: '100%', padding: '10px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '6px', color: '#1e293b' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                             <Layers size={14} color="#64748b" /> {t.libLoad}
                          </button>
                            <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />
                            <button onClick={() => { onEditAttr(comp); setActiveMenuId(null); }} style={{ width: '100%', padding: '10px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '6px', color: '#1e293b' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                               <Settings size={14} color="#64748b" /> {t.libEditAttr}
                            </button>
                            <button onClick={() => { showConfirm(t.libDelete, `Delete ${comp.name}?`, () => onDeleteComp(comp.id)); setActiveMenuId(null); }} style={{ width: '100%', padding: '10px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', borderRadius: '6px' }} onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'} onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                               <Trash2 size={14} /> {t.libDelete}
                            </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {comp.description && (
                    <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{comp.description}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

const ComponentSaveModal = ({ isOpen, onClose, onSave, lang, defaultName = '', initialData = null }: any) => {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'artifact' | 'situation'>('artifact');
  const t = (translations as any)[lang];

  useEffect(() => { if (isOpen) { setName(initialData?.name || defaultName); setDescription(initialData?.description || ''); setCategory('artifact'); } }, [isOpen, initialData, defaultName]);
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', borderRadius: '12px', width: '400px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{lang === 'ja' ? 'ライブラリへ保存' : 'Save to Library'}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>{t?.propName || 'Name'}</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>{t?.propType || 'Type'}</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setCategory('artifact')} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: category === 'artifact' ? '2px solid #4f46e5' : '1px solid #ddd', background: category === 'artifact' ? '#f5f3ff' : '#fff', color: category === 'artifact' ? '#4f46e5' : '#64748b', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>{t?.libTabArtifact || 'Create Artifacts'}</button>
            <button onClick={() => setCategory('situation')} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: category === 'situation' ? '2px solid #4f46e5' : '1px solid #ddd', background: category === 'situation' ? '#f5f3ff' : '#fff', color: category === 'situation' ? '#4f46e5' : '#64748b', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>{t?.libTabContext || 'Change Situation'}</button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>{t?.propDescription || 'Description'}</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minHeight: '80px' }} />
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #ddd', background: '#fff' }}>Cancel</button>
          <button onClick={() => onSave({ name, description, category })} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#1a192b', color: '#fff' }}>Save</button>
        </div>
      </div>
    </div>
  );
};

const ComponentAttributeModal = ({ isOpen, onClose, onSave, lang, comp }: any) => {
  const [name, setName] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorAvatar, setAuthorAvatar] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [category, setCategory] = useState<'artifact' | 'situation'>('artifact');
  const t = (translations as any)[lang];
 
   useEffect(() => {
     if (isOpen && comp) {
       setName(comp.name || '');
       setAuthorName(comp.authorName || '');
       setAuthorAvatar(comp.authorAvatar || '');
       setThumbnail(comp.thumbnail || '');
       setCategory(comp.category || 'artifact');
     }
   }, [isOpen, comp]);
 
   if (!isOpen) return null;
 
   return (
     <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(8px)' }}>
       <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '440px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid #eee' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div style={{ fontSize: '20px', fontWeight: '800', color: '#1a192b' }}>{t.libEditAttr}</div>
           <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
         </div>
         
         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
           <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>{t.propName}</label>
           <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }} placeholder={t.propName} />
         </div>
 
         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
           <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>{t.propType}</label>
           <div style={{ display: 'flex', gap: '10px' }}>
             <button 
               onClick={() => setCategory('artifact')}
               style={{ 
                 flex: 1, padding: '10px', borderRadius: '8px', border: category === 'artifact' ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                 background: category === 'artifact' ? '#f5f3ff' : '#fff', color: category === 'artifact' ? '#4f46e5' : '#64748b', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer'
               }}
             >
               {t.libTabArtifact}
             </button>
             <button 
               onClick={() => setCategory('situation')}
               style={{ 
                 flex: 1, padding: '10px', borderRadius: '8px', border: category === 'situation' ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                 background: category === 'situation' ? '#f5f3ff' : '#fff', color: category === 'situation' ? '#4f46e5' : '#64748b', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer'
               }}
             >
               {t.libTabContext}
             </button>
           </div>
         </div>
 
         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
           <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>{t.propAuthor}</label>
           <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }} placeholder={t.propAuthor} />
         </div>
 
         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
           <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>{t.propAuthorAvatar}</label>
           <input type="text" value={authorAvatar} onChange={(e) => setAuthorAvatar(e.target.value)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }} placeholder="https://example.com/avatar.png" />
         </div>
 
         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
           <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>{t.propCoverImage}</label>
           <input type="text" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }} placeholder="https://example.com/cover.png" />
         </div>
 
         <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
           <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
           <button onClick={() => onSave({ ...comp, name, authorName, authorAvatar, thumbnail, category })} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: 'none', background: '#4f46e5', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Save Changes</button>
         </div>
       </div>
     </div>
   );
 };

const ConfirmModal = React.memo(({ isOpen, title, message, onConfirm, onCancel, lang }: any) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(8px)' }}>
      <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '400px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid #eee' }}>
        <div style={{ fontSize: '18px', fontWeight: '800', color: '#1a192b' }}>{title}</div>
        <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>{message}</div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#666' }}>{lang === 'ja' ? 'キャンセル' : 'Cancel'}</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#1a192b', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#fff' }}>OK</button>
        </div>
      </div>
    </div>
  );
});

const TreeItem = ({ node, nodes, selectedId, onSelect, expandedNodeIds, onToggleExpand, level = 0 }: { node: Node, nodes: Node[], selectedId: string | null, onSelect: (id: string) => void, expandedNodeIds: Set<string>, onToggleExpand: (id: string) => void, level?: number }) => {
  const children = nodes.filter(n => n.parentId === node.id);
  const isOpen = expandedNodeIds.has(node.id);
  const isSelected = selectedId === node.id;

  return (
    <div style={{ marginLeft: level > 0 ? '12px' : '0' }}>
      <div 
        onClick={() => onSelect(node.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '6px 8px',
          borderRadius: '6px',
          cursor: 'pointer',
          background: isSelected ? '#f0f4ff' : 'transparent',
          color: isSelected ? '#4f46e5' : '#444',
          fontSize: '13px',
          fontWeight: isSelected ? 'bold' : 'normal',
          marginBottom: '2px',
          transition: 'all 0.1s'
        }}
      >
        <div onClick={(e) => { e.stopPropagation(); onToggleExpand(node.id); }} style={{ width: '20px', display: 'flex', alignItems: 'center', opacity: children.length > 0 ? 1 : 0 }}>
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
        <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {node.data.label || 'Unnamed Node'}
        </div>
      </div>
      {isOpen && children.length > 0 && (
        <div style={{ borderLeft: '1px solid #eee', marginLeft: '9px', paddingLeft: '4px' }}>
          {children.map(child => (
            <TreeItem key={child.id} node={child} nodes={nodes} selectedId={selectedId} onSelect={onSelect} expandedNodeIds={expandedNodeIds} onToggleExpand={onToggleExpand} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

// --- Restored Component: Sidebar (Cleaned) ---

const Sidebar = React.memo(({ onImport, onExport, onNew, onExportImage, onDeleteSelected, showGuide, onToggleGuide, onOpenComponentModal, onSaveToLibrary, lang, t, isOperational }: any) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => { 
    event.dataTransfer.setData('application/reactflow', nodeType); 
    event.dataTransfer.effectAllowed = 'move'; 
  };
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const nodeItemStyle: React.CSSProperties = {
    padding: '12px', 
    border: '1px solid #e0e0e0', 
    borderRadius: '12px', 
    marginBottom: '12px', 
    background: '#fff', 
    cursor: 'grab', 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '11px', 
    fontWeight: 'bold',
    color: '#1a192b',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  };

  return (
    <aside style={{ width: '240px', borderRight: '1px solid #eee', padding: '24px 16px', background: '#fcfcfc', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div style={{ fontSize: '18px', fontWeight: '800', color: '#1a192b', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #1a192b' }}>Activity by Contract</div>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
        <button onClick={onToggleGuide} style={{ flex: 1, height: '44px', borderRadius: '8px', border: '1px solid #1a192b', background: showGuide ? '#1a192b' : '#fff', color: showGuide ? '#fff' : '#1a192b', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={t.guideTitle}><HelpCircle size={20} /></button>
        <button onClick={onOpenComponentModal} style={{ flex: 1, height: '44px', borderRadius: '8px', border: '1px solid #eee', background: '#fff', color: '#1a192b', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} title={t.sidebarLibrary}><BookOpen size={20} /></button>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#8c8c8c', marginBottom: '15px' }}>{t.sidebarNodes}</div>
        
        <div 
          style={nodeItemStyle} draggable onDragStart={(e) => onDragStart(e, 'activity')}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#1a192b'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#e0e0e0'; }}
        >
          <div style={{ width: '64px', height: '44px', border: '2.5px solid #1a192b', borderRadius: '6px', marginBottom: '8px', position: 'relative' }}>
             <div style={{ position: 'absolute', top: '50%', left: '-6px', transform: 'translateY(-50%)', width: '10px', height: '10px', background: '#2196f3', borderRadius: '2px' }} />
             <div style={{ position: 'absolute', top: '50%', right: '-6px', transform: 'translateY(-50%)', width: '10px', height: '10px', background: '#ff4d4f', clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)' }} />
             <div style={{ position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)', width: '10px', height: '10px', background: '#10b981', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
             <div style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', width: '10px', height: '10px', background: '#f59e0b', clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }} />
          </div>
          {t.nodeActivity}
        </div>

        <div 
          style={nodeItemStyle} draggable onDragStart={(e) => onDragStart(e, 'artifact')}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#2196f3'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#e0e0e0'; }}
        >
          <div style={{ width: '64px', height: '44px', background: '#fff', border: '2.5px solid #2196f3', clipPath: 'polygon(15% 0%, 85% 0%, 100% 20%, 100% 80%, 85% 100%, 15% 100%, 0% 80%, 0% 20%)', marginBottom: '8px' }} />
          {t.nodeArtifact}
        </div>

        <div 
          style={nodeItemStyle} draggable onDragStart={(e) => onDragStart(e, 'context')}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#03a9f4'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#e0e0e0'; }}
        >
          <div style={{ width: '64px', height: '44px', background: '#fff', border: '2.5px dashed #03a9f4', clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)', marginBottom: '8px' }} />
          {t.nodeContext}
        </div>

        <div 
          style={nodeItemStyle} draggable onDragStart={(e) => onDragStart(e, 'gate')}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#1a192b'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#e0e0e0'; }}
        >
          <div style={{ width: '44px', height: '44px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '8px' }}>
            <svg width="40" height="40"><polygon points="20,2 38,20 20,38 2,20" fill="#fff" stroke="#1a192b" strokeWidth="2.5" /></svg>
          </div>
          {t.nodeGate}
        </div>

        <div 
          style={nodeItemStyle} draggable onDragStart={(e) => onDragStart(e, 'comment')}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#9c27b0'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#e0e0e0'; }}
        >
          <div style={{ width: '64px', height: '44px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '8px', background: 'rgba(156, 39, 176, 0.05)', border: '2px dashed #9c27b0', borderRadius: '4px', color: '#9c27b0' }}>
            <MessageSquare size={20} />
          </div>
          {t.nodeComment}
        </div>
      </div>

      <div>
        <div onClick={() => setIsActionsOpen(!isActionsOpen)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', color: '#8c8c8c', cursor: 'pointer' }}>
          <div>{t.sidebarActions}</div> {isActionsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
        {isActionsOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
            <button onClick={onNew} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #eee', background: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}><FilePlus size={16} /> {t.actionNew}</button>
            {isOperational && <button onClick={() => onSaveToLibrary()} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: '#1a192b', color: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}><Save size={16} /> {t.sidebarSaveToLib}</button>}
            <button onClick={onImport} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #eee', background: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}><Upload size={16} /> {t.sidebarImport}</button>
            <button onClick={onExport} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #eee', background: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}><Download size={16} /> {t.sidebarExport}</button>
            <button onClick={onExportImage} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #eee', background: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}><ImageIcon size={16} /> {t.actionExportImg}</button>
            <button onClick={onDeleteSelected} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #eee', background: '#fff', color: '#ff4d4f', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}><Trash2 size={16} /> {t.sidebarDeleteSelected}</button>
          </div>
        )}
      </div>
    </aside>
  );
});

const PropertiesPanel = ({ 
  nodes, node, selectedEdge, onUpdate, onUpdateEdge, onDeleteEdge, isOpen, onToggle, lang, onSelectNode, expandedNodeIds, onToggleExpand, isMember, isOperational 
}: any) => {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'attributes' | 'inputs' | 'outputs' | 'constraints' | 'assets'>('hierarchy');
  const t = (translations as any)[lang];

  useEffect(() => {
    if (node || selectedEdge) {
      if (activeTab === 'hierarchy') setActiveTab('attributes');
    } else {
      setActiveTab('hierarchy');
    }
  }, [node?.id, selectedEdge?.id]);

  const handleTabStyle = (tab: string): React.CSSProperties => ({
    padding: '10px 12px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 'bold',
    color: activeTab === tab ? '#1a192b' : '#999',
    borderBottom: activeTab === tab ? '2px solid #1a192b' : '2px solid transparent',
    whiteSpace: 'nowrap'
  });

  if (!isOpen) {
    return (
      <aside style={{ width: '0', background: '#fff', position: 'relative', overflow: 'visible', transition: 'width 0.3s ease' }}>
        <button 
          onClick={onToggle}
          style={{
            position: 'absolute', left: '-20px', top: '20px', width: '20px', height: '40px', background: '#fff', 
            border: '1px solid #eee', borderRight: 'none', borderRadius: '4px 0 0 4px', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 100
          }}
        >
          <ChevronLeft size={16} />
        </button>
      </aside>
    );
  }

  return (
    <aside style={{ 
      width: '320px', borderLeft: '1px solid #eee', background: '#fff', 
      display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease',
      position: 'relative', overflow: 'hidden', boxShadow: '-2px 0 8px rgba(0,0,0,0.05)'
    }}>
      <button 
        onClick={onToggle}
        style={{
          position: 'absolute', left: '0', top: '20px', width: '20px', height: '40px', background: '#fff', 
          border: '1px solid #eee', borderRight: 'none', borderRadius: '4px 0 0 4px', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 100
        }}
      >
        <ChevronRight size={16} />
      </button>

      <div style={{ flexShrink: 0, padding: '16px 20px', borderBottom: '1px solid #eee', background: '#fff', fontSize: '14px', fontWeight: 'bold', color: '#1a192b' }}>
        {t.propTitle}
      </div>

      <div style={{ flexShrink: 0, display: 'flex', borderBottom: '1px solid #f5f5f5', background: '#fcfcfc', overflowX: 'auto' }}>
        <div style={handleTabStyle('hierarchy')} onClick={() => setActiveTab('hierarchy')}>{t.propHierarchy}</div>
        {(node || selectedEdge) && (
          <div style={handleTabStyle('attributes')} onClick={() => setActiveTab('attributes')}>{t.propAttributes}</div>
        )}
        {node?.type === 'activity' && (
          <>
            <div style={handleTabStyle('inputs')} onClick={() => setActiveTab('inputs')}>{t.propInputs}</div>
            <div style={handleTabStyle('outputs')} onClick={() => setActiveTab('outputs')}>{t.propOutputs}</div>
            <div style={handleTabStyle('constraints')} onClick={() => setActiveTab('constraints')}>{t.propConstraints}</div>
            <div style={handleTabStyle('assets')} onClick={() => setActiveTab('assets')}>{t.propAssets}</div>
          </>
        )}
      </div>

      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px' }}>
        {activeTab === 'hierarchy' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#8c8c8c', marginBottom: '15px' }}>{t.propHierarchy}</div>
            {nodes.filter((n: Node) => !n.parentId).map((rn: Node) => (
              <TreeItem 
                key={rn.id} node={rn} nodes={nodes} selectedId={node?.id || null} 
                onSelect={onSelectNode} expandedNodeIds={expandedNodeIds} onToggleExpand={onToggleExpand} 
              />
            ))}
          </div>
        )}

        {activeTab === 'attributes' && selectedEdge && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#8c8c8c' }}>{t.propEdgeStyle}</div>
            
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px', color: '#64748b', textTransform: 'uppercase' }}>{t.propEdgeType}</label>
              <select 
                value={selectedEdge.type || 'default'}
                onChange={(e) => onUpdateEdge(selectedEdge.id, { type: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }}
              >
                <option value="default">{t.edgeTypeBezier}</option>
                <option value="straight">{t.edgeTypeStraight}</option>
                <option value="step">{t.edgeTypeStep}</option>
                <option value="smoothstep">{t.edgeTypeSmoothStep}</option>
              </select>
            </div>

            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px', color: '#64748b', textTransform: 'uppercase' }}>{t.propLabel}</label>
              <input type="text" value={selectedEdge.label as string || ''} onChange={(e) => onUpdateEdge(selectedEdge.id, { label: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }} />
            </div>

            {/* Side Selection */}
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px', color: '#64748b', textTransform: 'uppercase' }}>{t.propSourceSide}</label>
                  {(() => {
                    const sNode = nodes.find((n: any) => n.id === selectedEdge.source);
                    const nType = sNode?.type || 'activity';
                    const currentHId = selectedEdge.sourceHandle || '';
                    const currentSide = getSideForHandle(nType, currentHId) || 'right';
                    const availableSides = nType === 'artifact' ? ['left', 'right', 'top'] : nType === 'context' ? ['left', 'right', 'bottom'] : ['left', 'right', 'top', 'bottom'];

                    return (
                      <select 
                        value={currentSide}
                        onChange={(e) => {
                          const side = e.target.value;
                          if (side === currentSide && currentHId) return;
                          onUpdateEdge(selectedEdge.id, { sourceHandle: getHandleForSide(nType, side, true, currentHId, sNode?.data) });
                        }}
                        style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                      >
                        {availableSides.map(s => (
                          <option key={s} value={s}>{(t as any)[s] || s}</option>
                        ))}
                      </select>
                    );
                  })()}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px', color: '#64748b', textTransform: 'uppercase' }}>{t.propTargetSide}</label>
                  {(() => {
                    const tNode = nodes.find((n: any) => n.id === selectedEdge.target);
                    const nType = tNode?.type || 'activity';
                    const currentHId = selectedEdge.targetHandle || '';
                    const currentSide = getSideForHandle(nType, currentHId) || 'left';
                    const availableSides = nType === 'artifact' ? ['left', 'right', 'top'] : nType === 'context' ? ['left', 'right', 'bottom'] : ['left', 'right', 'top', 'bottom'];

                    return (
                      <select 
                        value={currentSide}
                        onChange={(e) => {
                          const side = e.target.value;
                          if (side === currentSide && currentHId) return;
                          onUpdateEdge(selectedEdge.id, { targetHandle: getHandleForSide(nType, side, false, currentHId, tNode?.data) });
                        }}
                        style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                      >
                        {availableSides.map(s => (
                          <option key={s} value={s}>{(t as any)[s] || s}</option>
                        ))}
                      </select>
                    );
                  })()}
                </div>
              </div>
            </div>

            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px', color: '#64748b', textTransform: 'uppercase' }}>{t.propColor}</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" value={selectedEdge.style?.stroke || '#1a192b'} onChange={(e) => onUpdateEdge(selectedEdge.id, { style: { ...selectedEdge.style, stroke: e.target.value }, markerEnd: { ...(typeof selectedEdge.markerEnd === 'object' ? selectedEdge.markerEnd : { type: MarkerType.ArrowClosed }), color: e.target.value } })} style={{ width: '40px', height: '30px', padding: '0', border: 'none', cursor: 'pointer' }} />
                <input type="text" value={selectedEdge.style?.stroke || '#1a192b'} onChange={(e) => onUpdateEdge(selectedEdge.id, { style: { ...selectedEdge.style, stroke: e.target.value } })} style={{ flex: 1, padding: '10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <input type="checkbox" id="edge-animated" checked={selectedEdge.animated} onChange={(e) => onUpdateEdge(selectedEdge.id, { animated: e.target.checked })} style={{ width: '18px', height: '18px' }} />
              <label htmlFor="edge-animated" style={{ fontSize: '13px', fontWeight: '600', color: '#1a192b', cursor: 'pointer' }}>{t.propEdgeAnimated}</label>
            </div>

            <button onClick={() => onDeleteEdge(selectedEdge.id)} style={{ width: '100%', padding: '14px', background: '#fee2e2', color: '#ef4444', border: '1px solid #fecdd3', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', transition: 'all 0.2s' }}>{t.actionDeleteEdge}</button>
          </div>
        )}

        {activeTab === 'attributes' && node && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px', color: '#64748b', textTransform: 'uppercase' }}>{t.propLabel}</label>
              <input type="text" value={node.data.label} onChange={(e) => onUpdate(node.id, { ...node.data, label: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }} />
            </div>

            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px', color: '#64748b', textTransform: 'uppercase' }}>{t.propColor || 'Color'}</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" value={node.data.color === 'transparent' ? '#ffffff' : (node.data.color || '#ffffff')} onChange={(e) => onUpdate(node.id, { ...node.data, color: e.target.value })} style={{ width: '40px', height: '30px', padding: '0', border: 'none', cursor: 'pointer' }} />
                <button 
                  onClick={() => onUpdate(node.id, { ...node.data, color: 'transparent' })}
                  style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid #cbd5e1', background: node.data.color === 'transparent' ? '#e2e8f0' : '#fff' }}
                >
                  Transparent
                </button>
              </div>
            </div>

            {/* Label Position Controls */}
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>
                {t.labelPlacement}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <select 
                  value={node.data.labelPlacement || 'inside'}
                  onChange={(e) => onUpdate(node.id, { ...node.data, labelPlacement: e.target.value })}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                >
                  <option value="inside">{t.labelInside}</option>
                  <option value="outside">{t.labelOutside}</option>
                </select>
                <div />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <select 
                  value={node.data.labelVAlign || 'top'}
                  onChange={(e) => onUpdate(node.id, { ...node.data, labelVAlign: e.target.value })}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                >
                  <option value="top">{t.top}</option>
                  <option value="middle">{t.middle}</option>
                  <option value="bottom">{t.bottom}</option>
                </select>
                <select 
                  value={node.data.labelHAlign || 'left'}
                  onChange={(e) => onUpdate(node.id, { ...node.data, labelHAlign: e.target.value })}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                >
                  <option value="left">{t.left}</option>
                  <option value="center">{t.center}</option>
                  <option value="right">{t.right}</option>
                </select>
              </div>
            </div>

            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px', color: '#64748b', textTransform: 'uppercase' }}>{t.propNotes}</label>
              <textarea value={node.data.notes || ''} onChange={(e) => onUpdate(node.id, { ...node.data, notes: e.target.value })} rows={4} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', resize: 'vertical' }} placeholder="..." />
            </div>
          </div>
        )}

        {activeTab === 'inputs' && node?.type === 'activity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: '12px' }}>
               <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e40af', textTransform: 'uppercase' }}>{t.propInputCount}</div>
               <input type="number" min={0} max={10} value={node.data.inputs || 0} onChange={(e) => onUpdate(node.id, { ...node.data, inputs: parseInt(e.target.value) || 0 })} style={{ width: '60px', padding: '4px', borderRadius: '4px', border: '1px solid #bfdbfe' }} />
            </div>
            {Array.from({ length: node.data.inputs || 0 }).map((_, i) => (
              <div key={`in-${i}`} style={{ background: '#fff', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#2196f3', marginBottom: '5px' }}>INPUT {i + 1}</div>
                <input type="text" placeholder={t.propName} value={node.data.handleData?.[`in-${i}`]?.name || ''} onChange={(e) => onUpdate(node.id, { ...node.data, handleData: { ...node.data.handleData, [`in-${i}`]: { ...node.data.handleData?.[`in-${i}`], name: e.target.value } } })} style={{ width: '100%', padding: '6px', border: '1px solid #eee', borderRadius: '4px', fontSize: '12px', marginBottom: '8px' }} />
                <textarea placeholder={t.propNotes || 'Description'} value={node.data.handleData?.[`in-${i}`]?.description || ''} onChange={(e) => onUpdate(node.id, { ...node.data, handleData: { ...node.data.handleData, [`in-${i}`]: { ...node.data.handleData?.[`in-${i}`], description: e.target.value } } })} rows={2} style={{ width: '100%', padding: '6px', border: '1px solid #eee', borderRadius: '4px', fontSize: '11px', resize: 'vertical' }} />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'outputs' && node?.type === 'activity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', background: '#fff1f2', borderRadius: '12px', border: '1px solid #fecdd3', display: 'flex', alignItems: 'center', gap: '12px' }}>
               <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#9f1239', textTransform: 'uppercase' }}>{t.propOutputCount}</div>
               <input type="number" min={0} max={10} value={node.data.outputs || 0} onChange={(e) => onUpdate(node.id, { ...node.data, outputs: parseInt(e.target.value) || 0 })} style={{ width: '60px', padding: '4px', borderRadius: '4px', border: '1px solid #fecdd3' }} />
            </div>
            {Array.from({ length: node.data.outputs || 0 }).map((_, i) => (
              <div key={`out-${i}`} style={{ background: '#fff', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#ff4d4f', marginBottom: '5px' }}>OUTPUT {i + 1}</div>
                <input type="text" placeholder={t.propName} value={node.data.handleData?.[`out-${i}`]?.name || ''} onChange={(e) => onUpdate(node.id, { ...node.data, handleData: { ...node.data.handleData, [`out-${i}`]: { ...node.data.handleData?.[`out-${i}`], name: e.target.value } } })} style={{ width: '100%', padding: '6px', border: '1px solid #eee', borderRadius: '4px', fontSize: '12px', marginBottom: '8px' }} />
                <textarea placeholder={t.propNotes || 'Description'} value={node.data.handleData?.[`out-${i}`]?.description || ''} onChange={(e) => onUpdate(node.id, { ...node.data, handleData: { ...node.data.handleData, [`out-${i}`]: { ...node.data.handleData?.[`out-${i}`], description: e.target.value } } })} rows={2} style={{ width: '100%', padding: '6px', border: '1px solid #eee', borderRadius: '4px', fontSize: '11px', resize: 'vertical' }} />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'constraints' && node?.type === 'activity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #dcfce7', display: 'flex', alignItems: 'center', gap: '12px' }}>
               <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#166534', textTransform: 'uppercase' }}>{t.propConstraintCount}</div>
               <input type="number" min={0} max={10} value={node.data.constraints || 0} onChange={(e) => onUpdate(node.id, { ...node.data, constraints: parseInt(e.target.value) || 0 })} style={{ width: '60px', padding: '4px', borderRadius: '4px', border: '1px solid #dcfce7' }} />
            </div>
            {Array.from({ length: node.data.constraints || 0 }).map((_, i) => (
              <div key={`con-${i}`} style={{ background: '#fff', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#4caf50', marginBottom: '5px' }}>CONTROL {i + 1}</div>
                <input type="text" placeholder={t.propName} value={node.data.handleData?.[`constraint-${i}`]?.name || ''} onChange={(e) => onUpdate(node.id, { ...node.data, handleData: { ...node.data.handleData, [`constraint-${i}`]: { ...node.data.handleData?.[`constraint-${i}`], name: e.target.value } } })} style={{ width: '100%', padding: '6px', border: '1px solid #eee', borderRadius: '4px', fontSize: '12px', marginBottom: '8px' }} />
                <textarea placeholder={t.propNotes || 'Description'} value={node.data.handleData?.[`constraint-${i}`]?.description || ''} onChange={(e) => onUpdate(node.id, { ...node.data, handleData: { ...node.data.handleData, [`constraint-${i}`]: { ...node.data.handleData?.[`constraint-${i}`], description: e.target.value } } })} rows={2} style={{ width: '100%', padding: '6px', border: '1px solid #eee', borderRadius: '4px', fontSize: '11px', resize: 'vertical' }} />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'assets' && node?.type === 'activity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', background: '#fff7ed', borderRadius: '12px', border: '1px solid #ffedd5', display: 'flex', alignItems: 'center', gap: '12px' }}>
               <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#9a3412', textTransform: 'uppercase' }}>{t.propAssetCount}</div>
               <input type="number" min={0} max={10} value={node.data.assets || 0} onChange={(e) => onUpdate(node.id, { ...node.data, assets: parseInt(e.target.value) || 0 })} style={{ width: '60px', padding: '4px', borderRadius: '4px', border: '1px solid #ffedd5' }} />
            </div>
            {Array.from({ length: node.data.assets || 0 }).map((_, i) => (
              <div key={`as-${i}`} style={{ background: '#fff', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#ff9800', marginBottom: '5px' }}>MECHANISM {i + 1}</div>
                <input type="text" placeholder={t.propName} value={node.data.handleData?.[`asset-${i}`]?.name || ''} onChange={(e) => onUpdate(node.id, { ...node.data, handleData: { ...node.data.handleData, [`asset-${i}`]: { ...node.data.handleData?.[`asset-${i}`], name: e.target.value } } })} style={{ width: '100%', padding: '6px', border: '1px solid #eee', borderRadius: '4px', fontSize: '12px', marginBottom: '8px' }} />
                <textarea placeholder={t.propNotes || 'Description'} value={node.data.handleData?.[`asset-${i}`]?.description || ''} onChange={(e) => onUpdate(node.id, { ...node.data, handleData: { ...node.data.handleData, [`asset-${i}`]: { ...node.data.handleData?.[`asset-${i}`], description: e.target.value } } })} rows={2} style={{ width: '100%', padding: '6px', border: '1px solid #eee', borderRadius: '4px', fontSize: '11px', resize: 'vertical' }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};


// --- Helper Functions for Edge Handles ---

const getSideForHandle = (nodeType: string, handleId: string): string => {
  if (!handleId) return 'right';
  const hId = handleId.toLowerCase();
  
  if (nodeType === 'activity') {
    if (hId.startsWith('in-')) return 'left';
    if (hId.startsWith('out-')) return 'right';
    if (hId.startsWith('constraint-')) return 'top';
    if (hId.startsWith('asset-')) return 'bottom';
  } else if (nodeType === 'context') {
    if (hId.startsWith('ctx-in-left')) return 'left';
    if (hId.startsWith('ctx-out-right')) return 'right';
    if (hId.startsWith('constraint-out')) return 'bottom';
  } else if (nodeType === 'gate') {
    if (hId.startsWith('in-0')) return 'left';
    if (hId.startsWith('out-0')) return 'right';
    if (hId.startsWith('in-1')) return 'top';
    if (hId.startsWith('out-1')) return 'bottom';
  } else if (nodeType === 'artifact') {
    if (hId.startsWith('art-in')) return 'left';
    if (hId.startsWith('art-out')) return 'right';
    if (hId.startsWith('asset-out')) return 'top';
  }
  
  // Generic fallback based on keywords in ID
  if (hId.includes('left')) return 'left';
  if (hId.includes('top')) return 'top';
  if (hId.includes('bottom')) return 'bottom';
  if (hId.includes('right')) return 'right';
  
  return 'right';
};

const getHandleForSide = (nodeType: string, side: string, isSource: boolean, currentHandleId: string, nodeData?: any): string => {
  // Extract index from current handle if possible (e.g. in-1 -> index 1)
  const indexMatch = currentHandleId?.match(/-(\d+)/);
  let index = indexMatch ? parseInt(indexMatch[1]) : 0;
  
  // Validate index against node capacity if data is provided
  if (nodeData && nodeType === 'activity') {
    let max = 0;
    if (side === 'left') max = (nodeData.inputs || 1) - 1;
    if (side === 'right') max = (nodeData.outputs || 1) - 1;
    if (side === 'top') max = (nodeData.constraints || 1) - 1;
    if (side === 'bottom') max = (nodeData.assets || 1) - 1;
    if (index > max) index = 0;
  }

  if (nodeType === 'activity') {
    if (side === 'left') return isSource ? `in-${index}-dual` : `in-${index}`;
    if (side === 'right') return isSource ? `out-${index}` : `out-${index}-dual`;
    if (side === 'top') return isSource ? `constraint-${index}-dual` : `constraint-${index}`;
    if (side === 'bottom') return isSource ? `asset-${index}-dual` : `asset-${index}`;
  } else if (nodeType === 'gate') {
    if (side === 'left') return isSource ? 'in-0-dual' : 'in-0';
    if (side === 'right') return isSource ? 'out-0' : 'out-0-dual';
    if (side === 'top') return isSource ? 'in-1-dual' : 'in-1';
    if (side === 'bottom') return isSource ? 'out-1' : 'out-1-dual';
  } else if (nodeType === 'context') {
    if (side === 'left') return isSource ? 'ctx-in-left-dual' : 'ctx-in-left';
    if (side === 'right') return isSource ? 'ctx-out-right' : 'ctx-out-right-dual';
    if (side === 'bottom') return isSource ? 'constraint-out' : 'constraint-out-dual';
  } else if (nodeType === 'artifact') {
    if (side === 'left') return isSource ? 'art-in-dual' : 'art-in';
    if (side === 'right') return isSource ? 'art-out' : 'art-out-dual';
    if (side === 'top') return isSource ? 'asset-out' : 'asset-out-dual';
  }
  
  // Default fallbacks
  return isSource ? 'out-0' : 'in-0';
};


// --- Main DnDFlow Component (Stabilized) ---

const INITIAL_ROOT_NODE: Node = {
  id: 'root_context',
  type: 'context',
  position: { x: 0, y: 0 },
  data: { 
    label: 'ビジネスコンテキスト', 
    isRoot: true,
    notes: 'このモデルの全体像を定義するルートコンテキストです。対象となるドメイン、境界条件、および主要なステークホルダーの関心をここに記述します。'
  },
  style: { width: 1200, height: 800 },
  width: 1200, height: 800, zIndex: 0, draggable: true,
};

let globalRenderCount = 0;
let instanceId = 0;

const DnDFlow = React.memo(() => {
  globalRenderCount++;
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { user } = useUser();
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
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [editingComp, setEditingComp] = useState<any>(null);
  const [isPropPanelOpen, setIsPropPanelOpen] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const onToggleGuide = useCallback(() => setShowGuide(prev => !prev), []);
  const [confirmConfig, setConfirmConfig] = useState<any>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set(['root_context']));

  useEffect(() => { 
    instanceId++;
    console.log(`[Modeler v2.2.16] Mounted. Instance ID: ${instanceId}`);
    setIsMounted(true); 
  }, []);
  
  const getAbsPos = useCallback((id: string, currentNodes: Node[]) => {
    let node = currentNodes.find(n => n.id === id);
    if (!node) return { x: 0, y: 0 };
    let x = node.position.x;
    let y = node.position.y;
    let pid = node.parentId;
    while (pid) {
      const p = currentNodes.find(nn => nn.id === pid);
      if (p) { x += p.position.x; y += p.position.y; pid = p.parentId; }
      else break;
    }
    return { x, y };
  }, []);

  // Helper to expand all parents of a node
  const expandToNode = useCallback((id: string, currentNodes: Node[]) => {
    setExpandedNodeIds(prev => {
      const next = new Set(prev);
      let curr = currentNodes.find(n => n.id === id);
      while (curr && curr.parentId) {
        next.add(curr.parentId);
        curr = currentNodes.find(n => n.id === curr?.parentId);
      }
      return next;
    });
  }, []);

  const onToggleExpand = useCallback((id: string) => {
    setExpandedNodeIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const currentLangRef = useRef(lang);
  useEffect(() => {
    if (currentLangRef.current !== lang) {
      currentLangRef.current = lang;
      setNodes(nds => nds.map(n => n.id === 'root_context' ? { ...n, data: { ...n.data, label: lang === 'ja' ? 'ビジネスコンテキスト' : 'Business Context' } } : n));
    }
  }, [lang, setNodes]);

  const refreshLibrary = useCallback(async () => {
    setIsLibraryLoading(true);
    try { const res = await fetch('/api/components'); const data = await res.json(); if (Array.isArray(data)) setDbComponents(data); }
    catch (err) { console.error('Library fetch failed:', err); }
    finally { setIsLibraryLoading(false); }
  }, []);

  const onUpdateAttributes = useCallback(async (updatedComp: any) => {
    try {
      const res = await fetch('/api/components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedComp),
      });
      if (res.ok) {
        setDbComponents(prev => prev.map(c => c.id === updatedComp.id ? updatedComp : c));
        // Sync root name if this component is the one being edited (or just sync all root contexts for safety)
        setNodes(nds => nds.map(n => n.id === 'root_context' ? { ...n, data: { ...n.data, label: updatedComp.name } } : n));
        setIsAttrModalOpen(false);
      }
    } catch (err) {
      console.error('Update attributes failed:', err);
    }
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
    
    // Check if dropped on a parent using absolute coordinates
    const nds = reactFlowInstance.getNodes();
    const candidates = nds.filter((n: Node) => {
      if (n.type !== 'context' && n.type !== 'activity') return false;
      const abs = getAbsPos(n.id, nds);
      return (
        position.x >= abs.x &&
        position.x <= abs.x + (n.width || 0) &&
        position.y >= abs.y &&
        position.y <= abs.y + (n.height || 0)
      );
    });

    // Find the deepest parent (smallest area)
    const parent = candidates.sort((a: any, b: any) => {
      const areaA = (a.width || 0) * (a.height || 0);
      const areaB = (b.width || 0) * (b.height || 0);
      return areaA - areaB;
    })[0];

    const nodeDescriptions: any = {
      activity: lang === 'ja' ? '入力を出力に変換する具体的な活動やプロセスです。' : 'Specific activity or process that transforms inputs to outputs.',
      artifact: lang === 'ja' ? 'プロセスで使用または生成される具体的な成果物やデータです。' : 'Specific artifact or data used or produced by the process.',
      context: lang === 'ja' ? '関連するアクティビティを包含する論理的な境界または状況です。' : 'Logical boundary or situation encompassing related activities.',
      gate: lang === 'ja' ? 'プロセスの分岐や合流を制御する論理ゲートです。' : 'Logic gate that controls process branching or merging.',
      comment: lang === 'ja' ? 'モデルに関する補足説明や注釈です。' : 'Additional explanation or annotation about the model.'
    };

    const newNode: Node = { 
      id: `node_${Date.now()}`, 
      type, 
      position: parent ? { x: position.x - getAbsPos(parent.id, nds).x, y: position.y - getAbsPos(parent.id, nds).y } : position, 
      parentId: parent?.id || (nodes.find((n: any) => n.id === 'root_context') ? 'root_context' : undefined),
      extent: (parent || nodes.find((n: any) => n.id === 'root_context')) ? 'parent' : undefined,
      data: { 
        label: `${type.charAt(0).toUpperCase() + type.slice(1)}`,
        notes: nodeDescriptions[type] || '',
        color: 'transparent',
        labelPlacement: 'inside',
        labelVAlign: 'top',
        labelHAlign: 'left',
        inputs: type === 'activity' ? 1 : undefined,
        outputs: type === 'activity' ? 1 : undefined,
        constraints: type === 'activity' ? 1 : undefined,
        assets: type === 'activity' ? 1 : undefined
      }, 
      width: NODE_WIDTH, 
      height: NODE_HEIGHT, 
      style: { width: NODE_WIDTH, height: NODE_HEIGHT } 
    };
    if (newNode.parentId === 'root_context' && !parent) {
       const root = nodes.find((n: any) => n.id === 'root_context');
       if (root) {
         newNode.position = { x: position.x - root.position.x, y: position.y - root.position.y };
       }
    }
    setNodes((nds: any) => nds.concat(newNode));
  }, [reactFlowInstance, setNodes, nodes]);

  // Ensure root_context always exists and parents orphans
  useEffect(() => {
    if (!isMounted) return;
    const hasRoot = nodes.some((n: any) => n.id === 'root_context');
    if (!hasRoot) {
      setNodes((prev: any) => {
        const rootNode = { 
          ...INITIAL_ROOT_NODE, 
          data: { ...INITIAL_ROOT_NODE.data, label: lang === 'ja' ? 'ビジネスコンテキスト' : 'Business Context' } 
        };
        // Parent any nodes that don't have a parent to the new root
        return [rootNode, ...prev.map((n: any) => (n.id !== 'root_context' && !n.parentId) ? { ...n, parentId: 'root_context', extent: 'parent' as const } : n)];
      });
    }
  }, [nodes, isMounted, lang]);

  // Sync root_context label with model name & Validate handles
  useEffect(() => {
    if (!isMounted) return;
    
    setNodes((prev: any) => {
      let changed = false;
      const next = prev.map((node: any) => {
        const connectedHandles = edges
          .filter((edge: any) => edge.source === node.id || edge.target === node.id)
          .map((edge: any) => edge.source === node.id ? edge.sourceHandle : edge.targetHandle)
          .filter(Boolean) as string[];
        
        const uniqueHandles = Array.from(new Set(connectedHandles));
        const currentValidation = node.data.validation?.connectedHandleIds || [];
        
        if (JSON.stringify(uniqueHandles.sort()) !== JSON.stringify(currentValidation.sort())) {
          changed = true;
          return {
            ...node,
            data: {
              ...node.data,
              validation: { ...node.data.validation, connectedHandleIds: uniqueHandles }
            }
          };
        }
        return node;
      });
      return changed ? next : prev;
    });
  }, [edges, isMounted]);

  const handleSelectComponent = (comp: any) => {
    const isLoad = comp.loadMode === 'load';
    const data = getCompData(comp);
    let tNodes = data.nodes || [];
    let tEdges = data.edges || [];

    // Detect existing root in the canvas
    const canvasHasRoot = nodes.some((n: any) => n.id === 'root_context');

    // Find any existing root node in the incoming component
    const incomingRoot = tNodes.find((n: any) => n.id === 'root_context' || n.data?.isRoot === true);
    const incomingRootId = incomingRoot?.id;

    if (incomingRootId) {
      // If we are loading, we overwrite everything, so 'root_context' stays.
      // If we are adding to an existing canvas that already has a root, we should remove the incoming root 
      // and re-parent its children to the canvas root to avoid double-rooting.
      if (!isLoad && canvasHasRoot) {
        tNodes = tNodes.filter((n: any) => n.id !== incomingRootId)
                       .map((n: any) => n.parentId === incomingRootId ? { ...n, parentId: 'root_context' } : n);
        tEdges = tEdges.filter((e: any) => e.source !== incomingRootId && e.target !== incomingRootId);
      } else {
        // Normalizing incoming root to 'root_context'
        tNodes = tNodes.map((n: any) => {
          if (n.id === incomingRootId) {
            return { ...n, id: 'root_context', data: { ...INITIAL_ROOT_NODE.data, ...n.data, isRoot: true, label: comp.name } };
          }
          if (n.parentId === incomingRootId) return { ...n, parentId: 'root_context' };
          return n;
        });
        tEdges = tEdges.map((e: any) => ({
          ...e,
          source: e.source === incomingRootId ? 'root_context' : e.source,
          target: e.target === incomingRootId ? 'root_context' : e.target,
        }));
      }
    } else {
      // No root found in coming component
      if (!isLoad && canvasHasRoot) {
        // If adding to existing, just re-parent orphans to canvas root
        tNodes = tNodes.map((n: any) => !n.parentId ? { ...n, parentId: 'root_context', extent: 'parent' } : n);
      } else {
        // Loading or adding to empty canvas, add system root
        const rootNode = { 
          ...INITIAL_ROOT_NODE, 
          data: { 
            ...INITIAL_ROOT_NODE.data, 
            label: comp.name || (lang === 'ja' ? '対象コンテキスト' : 'Target Context') 
          } 
        };
        tNodes = [rootNode, ...tNodes.map((n: any) => !n.parentId ? { ...n, parentId: 'root_context', extent: 'parent' } : n)];
      }
    }

    // Assign unique IDs to avoid collisions when adding
    if (!isLoad) {
      const namespace = `comp_${Math.random().toString(36).substr(2, 4)}_`;
      const idMap: any = {};
      tNodes = tNodes.map((n: any) => {
        if (n.id === 'root_context') return n; // Keep root stable
        const newId = namespace + n.id;
        idMap[n.id] = newId;
        return { ...n, id: newId, parentId: n.parentId === 'root_context' ? 'root_context' : (n.parentId ? namespace + n.parentId : n.parentId) };
      });
      tEdges = tEdges.map((e: any) => ({
        ...e,
        id: namespace + e.id,
        source: idMap[e.source] || e.source,
        target: idMap[e.target] || e.target,
      }));
    }

    if (isLoad) {
      setNodes(tNodes);
      setEdges(tEdges);
    } else {
      // Offset added nodes to avoid overlap
      tNodes = tNodes.map((n: any) => n.id === 'root_context' ? n : { ...n, position: { x: n.position.x + 50, y: n.position.y + 50 } });
      setNodes((nds: any) => nds.concat(tNodes));
      setEdges((eds: any) => eds.concat(tEdges));
    }
    setIsComponentModalOpen(false);
    setTimeout(() => { if (reactFlowInstance) reactFlowInstance.fitView({ padding: 0.2, duration: 800 }); }, 100);
  };

  const selectedNode = nodes.find((n: any) => n.id === selectedNodeId) || null;
  const selectedEdge = edges.find((e: any) => e.selected) || null;

  if (!isMounted) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', paddingTop: '0px', boxSizing: 'border-box', overflow: 'hidden' }}>
      <Sidebar
        lang={lang} setLang={setLang} t={t} isOperational={isOperational}
        onOpenComponentModal={() => setIsComponentModalOpen(true)}
        onSaveToLibrary={() => setIsSaveModalOpen(true)}
        onImport={() => {
           const input = document.getElementById('import-file') as HTMLInputElement;
           input.onchange = (e: any) => {
             const file = e.target.files[0];
             if (!file) return;
             const reader = new FileReader();
             reader.onload = (re: any) => {
               try {
                 const data = JSON.parse(re.target?.result as string);
                 let inNodes = data.nodes || [];
                 // Root consistency check
                 if (!inNodes.some((n: any) => n.id === 'root_context')) {
                   const rootNode = { ...INITIAL_ROOT_NODE, data: { ...INITIAL_ROOT_NODE.data, label: lang === 'ja' ? '対象コンテキスト' : 'Target Context' } };
                   inNodes = [rootNode, ...inNodes.map((n: any) => !n.parentId ? { ...n, parentId: 'root_context', extent: 'parent' } : n)];
                 }
                 setNodes(inNodes);
                 setEdges(data.edges || []);
               } catch (err) { console.error('Import failed:', err); }
             };
             reader.readAsText(file);
           };
           input.click();
        }}
        onDeleteSelected={() => setNodes((nds: any) => nds.filter((n: any) => !n.selected))}
        showGuide={showGuide}
        onToggleGuide={onToggleGuide}
        nodes={nodes}
        selectedNodeId={selectedNodeId}
        onSelectNode={(id: string) => {
          setSelectedNodeId(id);
          expandToNode(id, nodes);
          const n = nodes.find((node: any) => node.id === id);
          if (n && reactFlowInstance) {
            const abs = getAbsPos(id, nodes);
            reactFlowInstance.setCenter(abs.x + (n.width || 0) / 2, abs.y + (n.height || 0) / 2, { zoom: 1.2, duration: 800 });
          }
        }}
        expandedNodeIds={expandedNodeIds}
        onToggleExpand={(id: string) => {
          setExpandedNodeIds((prev: Set<string>) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          });
        }}
        onExport={() => {
           const data = { nodes, edges };
           const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
           const url = URL.createObjectURL(blob);
           const link = document.createElement('a');
           link.href = url;
           link.download = `abc-flow-${new Date().toISOString().slice(0, 10)}.json`;
           link.click();
        }}
        onNew={() => setIsConfirmResetOpen(true)}
        onExportImage={async () => {
          if (!reactFlowWrapper.current) return;
          const rootNode = nodes.find(n => n.id === 'root_context');
          if (!rootNode) return;

          const viewport = reactFlowWrapper.current.querySelector('.react-flow__viewport') as HTMLElement;
          if (!viewport) return;

          try {
            // Hide selection boxes and other UI for export
            const dataUrl = await toPng(viewport, {
              backgroundColor: '#fff',
              pixelRatio: 2,
              style: {
                transform: 'none', // Ensure it captures at 1:1 scale for processing
              }
            });
            const link = document.createElement('a');
            link.download = `abc-model-${new Date().toISOString().slice(0, 10)}.png`;
            link.href = dataUrl;
            link.click();
          } catch (err) {
            console.error('Image export failed:', err);
          }
        }}
      />

      <div style={{ flex: 1, position: 'relative' }} ref={reactFlowWrapper} onDrop={onDrop} onDragOver={(e: any) => e.preventDefault()}>
        <ReactFlow
          nodes={nodes} edges={edges}
          elevateEdgesOnSelect={true}
          connectionMode={ConnectionMode.Loose}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}
          onInit={setReactFlowInstance} nodeTypes={nodeTypes} fitView
          nodesDraggable={true} elementsSelectable={true}
          onNodeClick={(_: any, node: any) => {
            setSelectedNodeId(node.id);
            expandToNode(node.id, nodes);
          }}
          onPaneClick={() => setSelectedNodeId(null)}
          onNodeDragStop={(_: any, node: any) => {
            if (!reactFlowInstance) return;
            const nodesArr = reactFlowInstance.getNodes();
            const absNode = getAbsPos(node.id, nodesArr);
            
            const candidates = nodesArr.filter((n: any) => 
               n.id !== node.id && 
               (n.type === 'context' || n.type === 'activity') &&
               absNode.x >= getAbsPos(n.id, nodesArr).x &&
               absNode.x <= getAbsPos(n.id, nodesArr).x + (n.width || 0) &&
               absNode.y >= getAbsPos(n.id, nodesArr).y &&
               absNode.y <= getAbsPos(n.id, nodesArr).y + (n.height || 0)
            );
            
            // Find the deepest parent (smallest area)
            const parent = candidates.sort((a: any, b: any) => {
              const areaA = (a.width || 0) * (a.height || 0);
              const areaB = (b.width || 0) * (b.height || 0);
              return areaA - areaB;
            })[0];

            if (parent && parent.id !== node.parentId) {
              const absParent = getAbsPos(parent.id, nodesArr);
              setNodes((prev: any) => prev.map((n: any) => {
                if (n.id === node.id) {
                  return {
                    ...n,
                    parentId: parent.id,
                    position: {
                      x: absNode.x - absParent.x,
                      y: absNode.y - absParent.y
                    },
                    extent: 'parent' as const
                  };
                }
                return n;
              }));
              expandToNode(node.id, nodes);
            }
          }}
        >
          <Background />
          <Controls />
          <Panel position="bottom-center" style={{ background: 'rgba(255,255,255,0.8)', padding: '4px 12px', borderRadius: '20px', fontSize: '10px', color: '#666', border: '1px solid #eee', marginBottom: '10px' }}>
            Modeler v2.2.17-ALPHA • © 2026 GGBOF Institute
          </Panel>
        </ReactFlow>
      </div>

      <PropertiesPanel
        nodes={nodes}
        node={selectedNode} selectedEdge={selectedEdge}
        onUpdate={(id: string, data: any) => setNodes((nds: any) => nds.map((n: any) => n.id === id ? { ...n, data } : n))}
        onUpdateEdge={(id: string, updates: any) => setEdges((eds: any) => eds.map((e: any) => e.id === id ? { ...e, ...updates } : e))}
        onDeleteEdge={(id: string) => setEdges((eds: any) => eds.filter((e: any) => e.id !== id))}
        isOpen={isPropPanelOpen}
        onToggle={() => setIsPropPanelOpen(!isPropPanelOpen)}
        lang={lang}
        onSelectNode={(id: any) => {
          setSelectedNodeId(id);
          expandToNode(id, nodes);
          const n = nodes.find((node: any) => node.id === id);
          if (n && reactFlowInstance) {
            let wx = n.position.x;
            let wy = n.position.y;
            let pid = n.parentId;
            while (pid) {
              const p = nodes.find((nn: any) => nn.id === pid);
              if (p) { wx += p.position.x; wy += p.position.y; pid = p.parentId; }
              else break;
            }
            reactFlowInstance.setCenter(wx + (n.width || 0) / 2, wy + (n.height || 0) / 2, { zoom: 1.2, duration: 800 });
          }
        }}
        expandedNodeIds={expandedNodeIds}
        onToggleExpand={onToggleExpand}
        isMember={isMember}
        isOperational={isOperational}
      />

      <ComponentModal
        isOpen={isComponentModalOpen} onClose={() => setIsComponentModalOpen(false)}
        onSelect={handleSelectComponent} lang={lang} nodes={nodes} dbComponents={dbComponents} loading={isLibraryLoading} roles={roles} isOperational={isOperational} isMember={isMember}
        onLoadFullData={async (id: string) => { const res = await fetch(`/api/components?id=${id}`); const data: any = await res.json(); return Array.isArray(data) ? data[0]?.data : data?.data; }}
        showConfirm={(title: string, msg: string, cb: any) => { setConfirmConfig({ isOpen: true, title, message: msg, onConfirm: () => { cb(); setConfirmConfig((prev: any) => ({ ...prev, isOpen: false })); } }); }}
        onDeleteComp={async (id: string) => { try { await fetch(`/api/components?id=${id}`, { method: 'DELETE' }); refreshLibrary(); } catch(e) { alert('Delete failed'); } }}
        onEditAttr={(comp: any) => { setEditingComp(comp); setIsAttrModalOpen(true); }}
      />
      <ComponentAttributeModal
        isOpen={isAttrModalOpen}
        onClose={() => setIsAttrModalOpen(false)}
        onSave={onUpdateAttributes}
        lang={lang}
        comp={editingComp}
      />
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig((prev: any) => ({ ...prev, isOpen: false }))}
        lang={lang}
      />
      <ComponentSaveModal
        isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)}
        lang={lang} defaultName={lang === 'ja' ? '新規テンプレート' : 'New Template'}
        onSave={async (saveData: any) => {
          try {
            const res = await fetch('/api/components', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Date.now().toString(36), 
                ...saveData, 
                type: 'free', 
                data: { nodes, edges },
                authorName: user?.fullName || user?.username || 'Anonymous',
                authorAvatar: user?.imageUrl || ''
              })
            });
            if (res.ok) { alert('Saved!'); setIsSaveModalOpen(false); refreshLibrary(); }
          } catch(e) { alert('Save failed'); }
        }}
      />
      <input type="file" id="import-file" style={{ display: 'none' }} accept=".json" onChange={(e: any) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (re: any) => { try { const data = JSON.parse(re.target?.result as string); setNodes(data.nodes); setEdges(data.edges); } catch(err) { alert('Invalid file'); } };
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
