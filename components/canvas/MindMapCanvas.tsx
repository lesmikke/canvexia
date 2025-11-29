"use client";

import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ReactFlowProvider,
  useReactFlow,
  Node,
  Edge,
  NodeMouseHandler,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TextNode } from './TextNode';
import { NodeEditor } from '@/components/editor/NodeEditor';
import { supabase } from '@/lib/supabaseClient';
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

type NodeData = {
  label: string;
  content: string;
};

function CanvasInternal() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  
  const { screenToFlowPosition } = useReactFlow();
  const router = useRouter();

  // FIX: Memoize nodeTypes so React Flow doesn't complain during build
  const nodeTypes = useMemo(() => ({
    textNode: TextNode,
  }), []);

  const [mapId, setMapId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');

  useEffect(() => {
    const initCanvas = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      let { data: maps } = await supabase
        .from('mindmaps')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      let currentMapId = maps?.[0]?.id;

      if (!currentMapId) {
        const { data: newMap, error } = await supabase
          .from('mindmaps')
          .insert({ title: 'My First Mind Map', user_id: user.id })
          .select()
          .single();
        
        if (error || !newMap) return;
        currentMapId = newMap.id;
      }

      setMapId(currentMapId);

      const { data: nodeData } = await supabase
        .from('nodes')
        .select('*')
        .eq('map_id', currentMapId);

      if (nodeData) {
        setNodes(
          nodeData.map((n) => ({
            id: n.id,
            type: 'textNode',
            position: { x: n.position_x, y: n.position_y },
            data: { label: n.label, content: n.content },
          }))
        );
      }
    };

    initCanvas();
  }, [router, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onPaneClick = useCallback(
    async (event: React.MouseEvent) => {
      event.preventDefault();
      if (event.detail === 2 && mapId) {
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const newNodeId = `node-${Date.now()}`;
        const newNode: Node<NodeData> = {
          id: newNodeId,
          type: 'textNode',
          position,
          data: { label: 'New Thought', content: '<p>New idea...</p>' },
        };

        setNodes((nds) => nds.concat(newNode));

        await supabase.from('nodes').insert({
          id: newNodeId,
          map_id: mapId,
          label: newNode.data.label,
          content: newNode.data.content,
          position_x: position.x,
          position_y: position.y,
        });
      }
    },
    [screenToFlowPosition, setNodes, mapId],
  );

  const onNodeDragStop = useCallback(
    async (_: React.MouseEvent, node: Node) => {
      await supabase
        .from('nodes')
        .update({
          position_x: node.position.x,
          position_y: node.position.y,
        })
        .eq('id', node.id);
    },
    []
  );

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    // Safe cast since we know our nodes have this data
    const data = node.data as unknown as NodeData;
    setEditingNodeId(node.id);
    setEditorTitle(data?.label || 'Untitled');
    setEditorContent(data?.content || '');
    setIsEditorOpen(true);
  }, []);

  const handleSaveContent = useCallback(
    async (newContent: string) => {
      if (!editingNodeId) return;

      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === editingNodeId) {
            return {
              ...node,
              data: { ...node.data, content: newContent },
            };
          }
          return node;
        })
      );
      setEditorContent(newContent);

      await supabase
        .from('nodes')
        .update({ content: newContent })
        .eq('id', editingNodeId);
    },
    [editingNodeId, setNodes]
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!mapId) return <div className="h-screen flex items-center justify-center text-slate-500">Loading your space...</div>;

  return (
    <div className="h-screen w-full bg-slate-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onClick={onPaneClick}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        fitView
      >
        <Background gap={12} size={1} />
        <Controls />
        
        <Panel position="top-right" className="bg-white p-2 rounded-md shadow-md border border-slate-200">
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:text-red-700 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </Panel>

      </ReactFlow>

      <NodeEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editorTitle}
        initialContent={editorContent}
        onSave={handleSaveContent}
      />
    </div>
  );
}

export default function MindMapCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInternal />
    </ReactFlowProvider>
  );
}