'use client';

import React from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import {
  FileText, Activity, Database, User, Users, Briefcase, 
  Shield, Key, Play, CheckCircle, Info, Heart, 
  Circle, Square, Triangle, Hexagon, GripVertical
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export const NODE_WIDTH = 150;
export const NODE_HEIGHT = 80;
export const COMMENT_WIDTH = 200;
export const COMMENT_HEIGHT = 40;

export type NodeIconType = {
  id: string;
  label: string;
  icon: any;
};

export const NODE_ICONS: NodeIconType[] = [
  { id: 'none', label: 'None', icon: null },
  { id: 'file', label: 'File', icon: FileText },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'database', label: 'DB', icon: Database },
  { id: 'user', label: 'User', icon: User },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'briefcase', label: 'Briefcase', icon: Briefcase },
  { id: 'shield', label: 'Shield', icon: Shield },
  { id: 'key', label: 'Key', icon: Key },
  { id: 'play', label: 'Play', icon: Play },
  { id: 'check', label: 'Check', icon: CheckCircle },
  { id: 'info', label: 'Info', icon: Info },
  { id: 'heart', label: 'Heart', icon: Heart },
  { id: 'circle', label: 'Circle', icon: Circle },
  { id: 'square', label: 'Square', icon: Square },
  { id: 'triangle', label: 'Triangle', icon: Triangle },
  { id: 'hexagon', label: 'Hexagon', icon: Hexagon },
];

export const NodeIcon = ({ iconName, color = '#666', size = 24 }: { iconName?: string, color?: string, size?: number }) => {
  if (!iconName || iconName === 'none') return null;
  const match = NODE_ICONS.find(i => i.id === iconName);
  if (!match || !match.icon) return null;
  const Icon = match.icon;
  return <Icon size={size} color={color} style={{ flexShrink: 0 }} />;
};

export const ValidationWarning = ({ title }: { title?: string }) => (
  <div style={{
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    background: '#ff4d4f',
    color: '#fff',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    zIndex: 100,
    cursor: 'help',
    animation: 'pulse 2s infinite'
  }} title={title || 'Documentation missing'}>
    ⚠️
    <style>{`
      @keyframes pulse {
        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.7); }
        70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(255, 77, 79, 0); }
        100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 79, 0); }
      }
    `}</style>
  </div>
);

export const nodeStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  paddingTop: '10px',
  border: '1px solid #1a192b',
  boxShadow: '2px 2px 5px rgba(0,0,0,0.05)',
  position: 'relative'
};

export const getLabelPositionStyle = (data: any, defaultPlacement: 'inside' | 'outside' = 'inside'): React.CSSProperties => {
  const vAlign = data.labelVAlign || 'middle';
  const hAlign = data.labelHAlign || 'center';
  const place = data.labelPlacement || defaultPlacement;

  if (place === 'inside') {
    const style: React.CSSProperties = {
      position: 'absolute',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: 'max-content',
      maxWidth: '150px'
    };

    if (vAlign === 'top') { style.top = '10px'; }
    if (vAlign === 'middle') { style.top = '50%'; style.transform = 'translateY(-50%)'; }
    if (vAlign === 'bottom') { style.bottom = '10px'; }

    if (hAlign === 'left') { style.left = '10px'; }
    if (hAlign === 'center') { style.left = '50%'; style.transform = (style.transform || '') + ' translateX(-50%)'; }
    if (hAlign === 'right') { style.right = '10px'; }

    style.transform = style.transform?.trim() || undefined;
    return style;

  } else {
    // Outside
    const style: React.CSSProperties = {
      position: 'absolute',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      whiteSpace: 'nowrap'
    };

    if (vAlign === 'top') { style.bottom = 'calc(100% + 10px)'; }
    if (vAlign === 'middle') { style.top = '50%'; style.transform = 'translateY(-50%)'; }
    if (vAlign === 'bottom') { style.top = 'calc(100% + 10px)'; }

    if (vAlign === 'top' || vAlign === 'bottom') {
      if (hAlign === 'left') { style.left = '0'; }
      if (hAlign === 'center') { style.left = '50%'; style.transform = (style.transform || '') + ' translateX(-50%)'; }
      if (hAlign === 'right') { style.right = '0'; }
    } else {
      if (hAlign === 'left') { style.right = 'calc(100% + 10px)'; }
      if (hAlign === 'right') { style.left = 'calc(100% + 10px)'; }
      if (hAlign === 'center') { style.left = '50%'; style.transform = (style.transform || '') + ' translateX(-50%)'; }
    }

    style.transform = style.transform?.trim() || undefined;
    return style;
  }
};

export const CommentNode = ({ data, selected }: NodeProps) => {
  return (
    <>
      <NodeResizer minWidth={100} minHeight={30} isVisible={selected} lineClassName="border-purple-400" handleClassName="bg-white border-purple-400" />
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        background: 'transparent',
        padding: '5px',
        color: data.color || '#9c27b0', // Purple by default
        fontSize: '14px',
        fontWeight: '500',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        textAlign: 'left',
        position: 'relative',
        fontStyle: 'italic',
        pointerEvents: 'auto'
      }}>
        <div className="react-flow__node-drag-handle" style={{ position: 'absolute', inset: 0, zIndex: 0 }} />
        {/* Input handles for comments - allows them to be targets */}
        <Handle type="target" position={Position.Left} style={{ left: '-4px', background: '#9c27b0', border: '1px solid #fff', zIndex: 1000, pointerEvents: 'auto' }} />
        <Handle type="target" position={Position.Top} style={{ top: '-4px', left: '50%', transform: 'translateX(-50%)', background: '#9c27b0', border: '1px solid #fff', zIndex: 1000, pointerEvents: 'auto' }} />
        
        {/* Output handles for comments - allows them to be sources */}
        <Handle type="source" position={Position.Right} style={{ right: '-4px', background: '#9c27b0', border: '1px solid #fff', zIndex: 1000, pointerEvents: 'auto' }} />
        <Handle type="source" position={Position.Bottom} style={{ bottom: '-4px', left: '50%', transform: 'translateX(-50%)', background: '#9c27b0', border: '1px solid #fff', zIndex: 1000, pointerEvents: 'auto' }} />

        {data.label}
      </div>
    </>
  );
};

export const CriterionHandle = ({ type, position, id, index, total, color }: { type: 'source' | 'target', position: Position, id: string, index?: number, total?: number, color?: string }) => {
  const isTarget = type === 'target';
  const isHorizontal = position === Position.Left || position === Position.Right;
  const isVertical = position === Position.Top || position === Position.Bottom;

  const clipPath = isHorizontal
    ? (position === Position.Left ? 'polygon(0% 50%, 100% 0%, 100% 100%)' : 'polygon(0% 0%, 100% 50%, 0% 100%)')
    : (position === Position.Top ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'polygon(0% 0%, 100% 0%, 50% 100%)');

  if (isHorizontal && typeof index === 'number' && typeof total === 'number') {
    const step = NODE_HEIGHT / (total + 1);
    const top = `${step * (index + 1)}px`;
    const transform = 'translateY(-50%)';
    const leftOrRightStyle = position === Position.Left ? { left: '-8px' } : { right: '-8px' };

    return (
      <Handle
        type={type}
        position={position}
        id={id}
        style={{
          background: color || (isTarget ? '#3b82f6' : '#f43f5e'),
          border: 'none',
          width: '12px',
          height: '12px',
          borderRadius: '0',
          transform,
          clipPath,
          top,
          ...leftOrRightStyle,
          zIndex: 10,
          pointerEvents: 'auto'
        }}
      />
    );
  } else if (isVertical && typeof index === 'number' && typeof total === 'number') {
    const step = NODE_WIDTH / (total + 1);
    const left = `${step * (index + 1)}px`;
    const transform = 'translateX(-50%)';

    if (position === Position.Top) {
      return (
        <Handle
          type={type}
          position={position}
          id={id}
          style={{
            background: color || '#10b981',
            border: 'none',
            width: '12px',
            height: '12px',
            borderRadius: '0',
            transform,
            clipPath,
            top: '-8px',
            left,
            zIndex: 10,
            pointerEvents: 'auto'
          }}
        />
      );
    } else {
      return (
        <Handle
          type={type}
          position={position}
          id={id}
          style={{
            background: color || '#3b82f6',
            border: 'none',
            width: '12px',
            height: '12px',
            borderRadius: '0',
            transform,
            clipPath,
            bottom: '-8px',
            left,
            zIndex: 10,
            pointerEvents: 'auto'
          }}
        />
      );
    }
  } else {
    // Fallback for single or non-indexed handles
    if (position === Position.Top) {
      return (
        <Handle
          type={type}
          position={position}
          id={id}
          style={{
            background: color || '#4caf50',
            border: 'none',
            width: '12px',
            height: '12px',
            borderRadius: '0',
            transform: 'translateX(-50%)',
            clipPath,
            top: '-8px',
            left: '50%',
            zIndex: 10,
            pointerEvents: 'auto'
          }}
        />
      );
    }
 else if (position === Position.Bottom) {
      return (
        <Handle
          type={type}
          position={position}
          id={id}
          style={{
            background: color || '#2196f3',
            border: 'none',
            width: '12px',
            height: '12px',
            borderRadius: '0',
            transform: 'translateX(-50%)',
            clipPath,
            bottom: '-8px',
            left: '50%',
            zIndex: 10,
            pointerEvents: 'auto'
          }}
        />
      );
    }

    return (
      <Handle
        type={type}
        position={position}
        id={id}
        style={{
          background: color || (isTarget ? '#2196f3' : '#ff4d4f'),
          border: 'none',
          width: '12px',
          height: '12px',
          borderRadius: '0',
          transform: 'translate(-50%, -50%)',
          clipPath,
          top: '50%',
          left: '50%',
          zIndex: 10,
          pointerEvents: 'auto'
        }}
      />
    );
  }
};

export const ActivityNode = ({ data, selected }: NodeProps) => {
  const inputs = data.inputs !== undefined ? data.inputs : 1;
  const outputs = data.outputs !== undefined ? data.outputs : 1;
  const constraints = data.constraints !== undefined ? data.constraints : 1;
  const assets = data.assets !== undefined ? data.assets : 1;
  const { isMember, isOperational } = useLanguage();
  const isDocumented = !!data.notes;
  const connectedHandleIds = data.validation?.connectedHandleIds || [];
  
  // Check if any connected handle is missing documentation
  const hasIncompleteHandles = connectedHandleIds.some((hid: string) => !data.handleData?.[hid]?.description);
  const showWarning = !isDocumented || hasIncompleteHandles;

  return (
    <>
      <NodeResizer minWidth={NODE_WIDTH} minHeight={NODE_HEIGHT} isVisible={selected} lineClassName="border-blue-400" handleClassName="bg-white border-blue-400" />
      <div className="react-flow__node-drag-handle" style={{
        ...nodeStyle,
        background: data.bgImage ? `url(${data.bgImage})` : (data.color || 'rgba(255, 255, 255, 0.8)'),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '8px',
        border: '2px solid #1a192b',
        overflow: 'visible',
        pointerEvents: 'auto'
      }}>
        {showWarning && <ValidationWarning title={!isDocumented ? "Node documentation missing" : "Handle documentation missing"} />}
        {data.bgImage && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.3)',
            zIndex: 0
          }} />
        )}
        {/* Constraint Handles (Top) */}
        {Array.from({ length: constraints }).map((_, i) => {
          const step = NODE_WIDTH / (constraints + 1);
          const left = `${step * (i + 1)}px`;
          const handle = data.handleData?.[`constraint-${i}`];
          const isConnected = connectedHandleIds.includes(`constraint-${i}`);
          const isHandleDocumented = !!handle?.description;
          return (
            <React.Fragment key={`constraint-group-${i}`}>
              <CriterionHandle type="target" position={Position.Top} id={`constraint-${i}`} index={i} total={constraints} color="#4caf50" />
              {isConnected && !isHandleDocumented && (
                <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: '#ff4d4f', zIndex: 100 }}>⚠️</div>
              )}
              {handle?.name && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left,
                  transform: 'translateX(-50%)',
                  fontSize: '9px',
                  color: '#4caf50',
                  fontWeight: 'bold',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  maxWidth: '60px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {handle.name}
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Asset Handles (Bottom) */}
        {Array.from({ length: assets }).map((_, i) => {
          const step = NODE_WIDTH / (assets + 1);
          const left = `${step * (i + 1)}px`;
          const handle = data.handleData?.[`asset-${i}`];
          const isConnected = connectedHandleIds.includes(`asset-${i}`);
          const isHandleDocumented = !!handle?.description;
          return (
            <React.Fragment key={`asset-group-${i}`}>
              <CriterionHandle type="target" position={Position.Bottom} id={`asset-${i}`} index={i} total={assets} color="#ff9800" />
              {isConnected && !isHandleDocumented && (
                <div style={{ position: 'absolute', bottom: '-15px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: '#ff4d4f', zIndex: 100 }}>⚠️</div>
              )}
              {handle?.name && (
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  left,
                  transform: 'translateX(-50%)',
                  fontSize: '9px',
                  color: '#ff9800',
                  fontWeight: 'bold',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  maxWidth: '60px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {handle.name}
                </div>
              )}
            </React.Fragment>
          );
        })}

        {Array.from({ length: inputs }).map((_, i) => {
          const step = NODE_HEIGHT / (inputs + 1);
          const top = step * (i + 1);
          const handle = data.handleData?.[`in-${i}`];
          const isConnected = connectedHandleIds.includes(`in-${i}`);
          const isHandleDocumented = !!handle?.description;
          return (
            <React.Fragment key={`in-group-${i}`}>
              <CriterionHandle type="target" position={Position.Left} id={`in-${i}`} index={i} total={inputs} />
              {isConnected && !isHandleDocumented && (
                <div style={{ position: 'absolute', top: '50%', left: '-15px', transform: 'translateY(-50%)', fontSize: '10px', color: '#ff4d4f', zIndex: 100 }}>⚠️</div>
              )}
              {handle?.name && (
                <div style={{
                  position: 'absolute',
                  top: `${top}px`,
                  left: '10px',
                  transform: 'translateY(-50%)',
                  fontSize: '9px',
                  color: '#2196f3',
                  fontWeight: 'bold',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  maxWidth: '60px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {handle.name}
                </div>
              )}
            </React.Fragment>
          );
        })}

        <div style={getLabelPositionStyle(data, 'inside')}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: data.bgImage ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
            backdropFilter: data.bgImage ? 'blur(4px)' : 'none',
            padding: data.bgImage ? '6px 12px' : '0',
            borderRadius: '8px',
            boxShadow: data.bgImage ? '0 2px 10px rgba(0,0,0,0.1)' : 'none',
            position: 'relative',
            minWidth: '60px'
          }}>
            {/* Corner Icon */}
            {data.icon && data.iconPosition && data.iconPosition !== 'center' && (
              <div style={{
                position: 'absolute',
                top: data.iconPosition.includes('top') ? '-5px' : 'auto',
                bottom: data.iconPosition.includes('bottom') ? '-5px' : 'auto',
                left: data.iconPosition.includes('left') ? '-5px' : 'auto',
                right: data.iconPosition.includes('right') ? '-5px' : 'auto',
                background: '#fff',
                padding: '2px',
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                zIndex: 20
              }}>
                <NodeIcon iconName={data.icon} color="#4f46e5" size={16} />
              </div>
            )}
            
            {/* Center Icon (Fallback/Standard) */}
            {(!data.iconPosition || data.iconPosition === 'center') && (
              <NodeIcon iconName={data.icon} color="#2196f3" size={24} />
            )}
            
            <div style={{
              fontWeight: 'bold',
              fontSize: '14px',
              textAlign: 'center',
              color: '#1a192b'
            }}>
              {data.label}
            </div>
          </div>
        </div>

        {data.notes && !(data.lockNotes && !isMember && !isOperational) && (
          <div style={{ position: 'absolute', bottom: '5px', right: '5px', fontSize: '12px', color: '#1a192b', zIndex: 1 }}>📝</div>
        )}

        {Array.from({ length: outputs }).map((_, i) => {
          const step = NODE_HEIGHT / (outputs + 1);
          const top = step * (i + 1);
          const handle = data.handleData?.[`out-${i}`];
          const isConnected = connectedHandleIds.includes(`out-${i}`);
          const isHandleDocumented = !!handle?.description;
          return (
            <React.Fragment key={`out-group-${i}`}>
              <CriterionHandle type="source" position={Position.Right} id={`out-${i}`} index={i} total={outputs} />
              {isConnected && !isHandleDocumented && (
                <div style={{ position: 'absolute', top: '50%', right: '-15px', transform: 'translateY(-50%)', fontSize: '10px', color: '#ff4d4f', zIndex: 100 }}>⚠️</div>
              )}
              {handle?.name && (
                <div style={{
                  position: 'absolute',
                  top: `${top}px`,
                  right: '10px',
                  transform: 'translateY(-50%)',
                  fontSize: '9px',
                  color: '#ff4d4f',
                  fontWeight: 'bold',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  textAlign: 'right',
                  maxWidth: '60px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {handle.name}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
};

export const ArtifactNode = ({ data, selected }: NodeProps) => {
  const { isMember, isOperational } = useLanguage();
  const isDocumented = !!data.notes;
  const showWarning = !isDocumented && !data.isRoot; // Don't warn on internal context usage if it's just a structural element, but Artifacts should be documented
  return (
    <>
      <NodeResizer minWidth={NODE_WIDTH} minHeight={NODE_HEIGHT} isVisible={selected} lineClassName="border-blue-400" handleClassName="bg-white border-blue-400" />
      <div className="react-flow__node-drag-handle" style={{ ...nodeStyle, border: 'none', background: 'transparent', boxShadow: 'none', overflow: 'visible', pointerEvents: 'auto' }}>
        {showWarning && <ValidationWarning title="Artifact documentation missing" />}
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, zIndex: -1 }}>
          <polygon
            points="10,2 90,2 98,15 98,85 90,98 10,98 2,85 2,15"
            fill={data.bgImage ? 'transparent' : (data.color || 'rgba(255, 255, 255, 0.9)')}
            stroke="#2196f3"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {data.bgImage && (
          <div style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            right: '4px',
            bottom: '4px',
            background: `url(${data.bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: -2,
            clipPath: 'polygon(10% 0%, 90% 0%, 100% 15%, 100% 85%, 90% 100%, 10% 100%, 0% 85%, 0% 15%)',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.2)' }} />
          </div>
        )}
        <div style={getLabelPositionStyle(data, 'inside')}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: data.bgImage ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
            backdropFilter: data.bgImage ? 'blur(4px)' : 'none',
            padding: data.bgImage ? '6px 12px' : '0',
            borderRadius: '8px',
            boxShadow: data.bgImage ? '0 2px 10px rgba(0,0,0,0.1)' : 'none',
          }}>
            <NodeIcon iconName={data.icon} color="#2196f3" size={24} />
            <div style={{
              fontWeight: 'bold',
              fontSize: '14px',
              textAlign: 'center',
              width: '100%',
              wordBreak: 'break-word',
            }}>
              {data.label}
            </div>
          </div>
        </div>

        <Handle type="target" position={Position.Left} style={{ background: '#2196f3', left: '-2px', zIndex: 1000, pointerEvents: 'auto' }} />
        {data.notes && !(data.lockNotes && !isMember && !isOperational) && (
          <div style={{ position: 'absolute', bottom: '10px', right: '20%', fontSize: '12px', color: '#1a192b', zIndex: 1, pointerEvents: 'none' }}>📝</div>
        )}
        <Handle type="source" position={Position.Right} style={{ background: '#2196f3', right: '-2px', zIndex: 1000, pointerEvents: 'auto' }} />

        {/* Asset Source (Top) for IDEF0 Mechanism */}
        <Handle type="source" position={Position.Top} id="asset-out" style={{ background: '#ff9800', top: '-2px', zIndex: 1000, pointerEvents: 'auto' }} />
      </div>
    </>
  );
};

export const ContextNode = ({ data, selected }: NodeProps) => {
  const isRoot = data.isRoot;
  const { lang, isMember, isOperational } = useLanguage();
  const isDocumented = !!data.notes;
  const showWarning = !isDocumented && !isRoot; // Root context should be named after model, but nodes inside it need notes. Actually user said *all* nodes should have notes.
  // Wait, user said "すべてのノード ... すべてノートを記載すること". So even root context?
  // User: "すべてのノード ... は、すべてノートを記載すること"
  const finalWarning = !isDocumented;
  return (
    <>
      <NodeResizer minWidth={NODE_WIDTH} minHeight={NODE_HEIGHT} isVisible={selected} lineClassName="border-blue-400" handleClassName="bg-white border-blue-400" />
      <div style={{
        ...nodeStyle,
        border: 'none',
        background: 'transparent',
        boxShadow: isRoot ? 'none' : nodeStyle.boxShadow,
        paddingTop: isRoot ? '24px' : '10px',
      }}>
        {finalWarning && <ValidationWarning title="Context documentation missing" />}
        {/* The background of the context node should NOT be draggable to allow child interaction */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          pointerEvents: 'none'
        }} />
        {/* Visual drag handle bar at the top */}
        <div className="react-flow__node-drag-handle" style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: '40px', 
          background: isRoot ? 'transparent' : 'rgba(3, 169, 244, 0.05)',
          borderBottom: isRoot ? 'none' : '1px solid rgba(3, 169, 244, 0.2)',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          pointerEvents: 'auto',
          zIndex: 5,
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '10px'
        }}>
          <GripVertical size={14} color="#03a9f4" style={{ opacity: isRoot ? 0.3 : 0.5 }} />
        </div>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, zIndex: -1, pointerEvents: 'none' }}>
          <rect
            x="2" y="2" width="96" height="96" rx="8" ry="8"
            fill={data.bgImage ? 'transparent' : (isRoot ? 'transparent' : (data.color || 'rgba(239, 246, 255, 0.4)'))}
            stroke={isRoot ? '#cbd5e1' : '#3b82f6'}
            strokeWidth={isRoot ? '2' : '2'}
            strokeDasharray={isRoot ? '8,4' : 'none'}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {data.bgImage && (
          <div style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            right: '4px',
            bottom: '4px',
            background: `url(${data.bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: -2,
            clipPath: 'polygon(10% 0%, 90% 0%, 100% 15%, 100% 85%, 90% 100%, 10% 100%, 0% 85%, 0% 15%)',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.2)' }} />
          </div>
        )}
        <Handle type="target" position={Position.Left} id="ctx-in-left" style={{ background: '#03a9f4', left: '-2px', pointerEvents: 'auto', zIndex: 10 }} />
        <div style={{...getLabelPositionStyle(isRoot ? { ...data, labelVAlign: 'top', labelHAlign: 'center' } : data, 'inside'), pointerEvents: 'auto'}}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: data.bgImage ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
            backdropFilter: data.bgImage ? 'blur(4px)' : 'none',
            padding: data.bgImage ? '6px 12px' : '0',
            borderRadius: '8px',
            boxShadow: data.bgImage ? '0 2px 10px rgba(0,0,0,0.1)' : 'none',
          }}>
            <NodeIcon iconName={data.icon} color={isRoot ? '#64748b' : '#03a9f4'} size={20} />
            <div style={{
              fontWeight: 'bold',
              fontSize: isRoot ? '12px' : '14px',
              textAlign: 'center',
              width: '100%',
              marginTop: '5px',
              opacity: isRoot ? 0.6 : 1,
              color: isRoot ? '#64748b' : '#1a192b',
            }}>
              {data.label}
            </div>
          </div>
        </div>

        {data.notes && !(data.lockNotes && !isMember && !isOperational) && (
          <div style={{ position: 'absolute', bottom: '10px', right: '20%', fontSize: '12px', color: '#1a192b', opacity: isRoot ? 0.5 : 1, zIndex: 1 }}>📝</div>
        )}
        <Handle type="source" position={Position.Right} id="ctx-out-right" style={{ background: '#03a9f4', right: '-2px', pointerEvents: 'auto', zIndex: 10 }} />

        {/* Constraint Source (Bottom) for IDEF0 Control */}
        <Handle type="source" position={Position.Bottom} id="constraint-out" style={{ background: '#4caf50', bottom: '-2px', pointerEvents: 'auto', zIndex: 10 }} />
      </div>
    </>
  );
};

export const GateNode = ({ data, selected }: NodeProps) => {
  const { isMember, isOperational } = useLanguage();
  return (
    <>
      <NodeResizer minWidth={60} minHeight={60} isVisible={selected} lineClassName="border-blue-400" handleClassName="bg-white border-blue-400" />
      <div className="react-flow__node-drag-handle" style={{
        position: 'relative',
        width: '80px',
        height: '80px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'visible',
        pointerEvents: 'auto'
      }}>
        <svg width="80" height="80" style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', zIndex: -1 }}>
          <polygon
            points="40,0 80,40 40,80 0,40"
            fill={data.bgImage ? 'transparent' : (data.color || 'rgba(255, 255, 255, 0.9)')}
            stroke="#1a192b"
            strokeWidth="2"
            style={{ filter: selected ? 'drop-shadow(0 0 4px #2196f3)' : 'none' }}
          />
        </svg>
        {data.bgImage && (
          <div style={{
            position: 'absolute',
            inset: '2px',
            background: `url(${data.bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: -2,
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.2)' }} />
          </div>
        )}
        <div style={getLabelPositionStyle(data, 'inside')}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: data.bgImage ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
            backdropFilter: data.bgImage ? 'blur(4px)' : 'none',
            padding: data.bgImage ? '4px 6px' : '0',
            borderRadius: '6px',
            boxShadow: data.bgImage ? '0 2px 10px rgba(0,0,0,0.1)' : 'none',
          }}>
            <NodeIcon iconName={data.icon} color="#1a192b" size={16} />
            <div style={{
              fontWeight: 'bold',
              fontSize: '11px',
              textAlign: 'center',
              width: '100%',
              wordBreak: 'break-word',
            }}>
              {data.label}
            </div>
          </div>
        </div>
        
        {data.notes && !(data.lockNotes && !isMember && !isOperational) && (
          <div style={{ position: 'absolute', bottom: '5px', right: '5px', fontSize: '10px', color: '#1a192b', zIndex: 1 }}>📝</div>
        )}

        {/* Handles aligned to the diamond's points with labels */}
        {/* Input (Left) - in-0 */}
        <Handle type="target" position={Position.Left} id="in-0" style={{ left: '-4px', top: '40px', background: '#3b82f6', border: '1px solid #fff', zIndex: 10, pointerEvents: 'auto' }} />
        {data.handleData?.['in-0']?.name && (
          <div style={{ position: 'absolute', top: '40px', left: '10px', transform: 'translateY(-50%)', fontSize: '9px', color: '#3b82f6', fontWeight: 'bold', pointerEvents: 'none' }}>
            {data.handleData['in-0'].name}
          </div>
        )}

        {/* Output 1 (Right) - out-0 */}
        <Handle type="source" position={Position.Right} id="out-0" style={{ right: '-4px', top: '40px', background: '#f43f5e', border: '1px solid #fff', zIndex: 10, pointerEvents: 'auto' }} />
        {data.handleData?.['out-0']?.name && (
          <div style={{ position: 'absolute', top: '40px', right: '10px', transform: 'translateY(-50%)', fontSize: '9px', color: '#f43f5e', fontWeight: 'bold', pointerEvents: 'none', textAlign: 'right' }}>
            {data.handleData['out-0'].name}
          </div>
        )}

        {/* Input/Alternative (Top) - in-1 or top-in */}
        <Handle type="target" position={Position.Top} id="in-1" style={{ top: '-4px', left: '40px', background: '#10b981', border: '1px solid #fff', zIndex: 10, pointerEvents: 'auto' }} />

        {/* Output 2 (Bottom) - out-1 */}
        <Handle type="source" position={Position.Bottom} id="out-1" style={{ bottom: '-4px', left: '40px', background: '#f43f5e', border: '1px solid #fff', zIndex: 10, pointerEvents: 'auto' }} />
        {data.handleData?.['out-1']?.name && (
          <div style={{ position: 'absolute', bottom: '10px', left: '40px', transform: 'translateX(-50%)', fontSize: '9px', color: '#f43f5e', fontWeight: 'bold', pointerEvents: 'none' }}>
            {data.handleData['out-1'].name}
          </div>
        )}
      </div>
    </>
  );
};

export const nodeTypes = {
  artifact: ArtifactNode,
  context: ContextNode,
  activity: ActivityNode,
  gate: GateNode,
  comment: CommentNode,
};
