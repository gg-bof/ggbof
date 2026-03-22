'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Node,
  Edge,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useLanguage } from '@/components/LanguageContext';
import { nodeTypes, NODE_WIDTH, NODE_HEIGHT } from '../components/NodeTypes';

const INITIAL_ROOT_NODE: Node = {
  id: 'root_context',
  type: 'context',
  position: { x: 0, y: 0 },
  data: { label: 'Target Context (DIAGNOSTIC)' },
  style: { width: 1200, height: 800 },
  width: 1200,
  height: 800,
  draggable: true,
  selectable: true,
};

let globalRenderCount = 0;

const DnDFlow = React.memo(() => {
  globalRenderCount++;
  
  const [nodes, setNodes, onNodesChange] = useNodesState([INITIAL_ROOT_NODE]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    console.log("[ABC-DIAG] Modeler Mounted. Version v2.2.7");
  }, []);

  if (!isMounted) return <div style={{ padding: '20px' }}>Loading Diagnostic Modeler...</div>;

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#fff' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
      >
        <Background />
        <Controls />
        <Panel position="top-right" style={{ background: '#fff', padding: '15px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '300px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>DIAGNOSTIC MODE v2.2.7</div>
          <div style={{ fontSize: '13px', color: '#666' }}>
            This version is stripped of all complex side-effects to isolate the interactivity issue.
          </div>
          <hr style={{ margin: '10px 0' }} />
          <div style={{ fontSize: '14px' }}>
            <strong>Renders: {globalRenderCount}</strong>
          </div>
          <div style={{ fontSize: '10px', color: '#999', marginTop: '10px' }}>
             Nodes: {nodes.length} | Edges: {edges.length}
          </div>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ width: '100%', marginTop: '15px', padding: '10px', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            CLEAR CACHE & RELOAD
          </button>
        </Panel>
      </ReactFlow>
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
