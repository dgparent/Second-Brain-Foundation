"use client";

import { useEffect } from 'react';
import ReactFlow, { 
  Node, 
  Edge, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  MarkerType,
  BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes: Node[] = [
  { 
    id: '1', 
    position: { x: 0, y: 0 }, 
    data: { label: 'Research Topic' },
    style: { 
        background: '#fff', 
        color: '#000', 
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '10px 20px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    }
  },
];
const initialEdges: Edge[] = [];

interface MindMapProps {
  data?: any;
  nodes?: Node[];
  edges?: Edge[];
}

export function MindMap({ data, nodes: initialNodesProp = initialNodes, edges: initialEdgesProp = initialEdges }: MindMapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodesProp);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdgesProp);

  useEffect(() => {
    if (!data) return;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    let nodeIdCounter = 1;

    const traverse = (node: any, x: number, y: number, level: number, parentId: string | null) => {
      const currentId = `node-${nodeIdCounter++}`;
      
      newNodes.push({
        id: currentId,
        position: { x, y },
        data: { label: node.title },
        style: { 
            background: '#fff', 
            color: '#000', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '10px 20px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            width: 150,
            fontSize: '12px'
        }
      });

      if (parentId) {
        newEdges.push({
          id: `edge-${parentId}-${currentId}`,
          source: parentId,
          target: currentId,
          type: 'smoothstep',
          style: { stroke: '#9ca3af' },
        });
      }

      if (node.children && node.children.length > 0) {
        const totalWidth = node.children.length * 200;
        let startX = x - totalWidth / 2 + 100;
        
        node.children.forEach((child: any) => {
          traverse(child, startX, y + 150, level + 1, currentId);
          startX += 200;
        });
      }
    };

    traverse(data, 0, 0, 0, null);

    setNodes(newNodes);
    setEdges(newEdges);
  }, [data, setNodes, setEdges]);

  return (
    <div className="w-full h-full bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background color="#9ca3af" gap={40} size={2} variant={BackgroundVariant.Dots} />
        <Controls className="!bg-white !border-gray-200 !text-black [&>button]:!border-gray-200 [&>button:hover]:!bg-gray-100 [&>button]:!fill-black" />
      </ReactFlow>
    </div>
  );
}
