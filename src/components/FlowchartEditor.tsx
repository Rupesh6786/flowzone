
"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  type OnConnect,
  type Node,
  type Edge,
  type ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { TerminatorNode, ProcessNode, DecisionNode, InputOutputNode, PredefinedProcessNode, ConnectorNode, DataNode } from './CustomNodes';
import { Input } from './ui/input';
import { Label } from './ui/label';

const nodeTypes = {
  terminator: TerminatorNode,
  process: ProcessNode,
  decision: DecisionNode,
  inputOutput: InputOutputNode,
  predefinedProcess: PredefinedProcessNode,
  connector: ConnectorNode,
  data: DataNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

let id = 0;
const getId = () => `dndnode_${id++}`;

const NodePalette = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow-label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="border-r-2 p-4 text-sm w-64 bg-background/80 space-y-3 overflow-y-auto">
      <div className="mb-2 font-semibold text-center">Drag to Add Nodes</div>
      <div
        className="p-3 border-primary/50 border-2 border-dashed rounded-full cursor-grab text-center bg-card hover:bg-card/90 hover:border-primary transition-colors flex justify-center items-center"
        onDragStart={(event) => onDragStart(event, 'terminator', 'Start/End')}
        draggable
      >
        Terminator
      </div>
      <div
        className="p-3 border-primary/50 border-2 border-dashed rounded-md cursor-grab text-center bg-card hover:bg-card/90 hover:border-primary transition-colors flex justify-center items-center"
        onDragStart={(event) => onDragStart(event, 'process', 'Process')}
        draggable
      >
        Process
      </div>
       <div
        className="h-28 flex items-center justify-center cursor-grab"
        onDragStart={(event) => onDragStart(event, 'decision', 'Decision')}
        draggable
      >
        <div className="w-20 h-20 flex items-center justify-center transform rotate-45 bg-card hover:bg-card/90 text-center border-primary/50 border-2 border-dashed hover:border-primary transition-colors">
            <span className="transform -rotate-45">Decision</span>
        </div>
      </div>
      <div
        className="p-3 border-primary/50 border-2 border-dashed -skew-x-[20deg] cursor-grab text-center bg-card hover:bg-card/90 hover:border-primary transition-colors flex justify-center items-center"
        onDragStart={(event) => onDragStart(event, 'inputOutput', 'Input/Output')}
        draggable
      >
        <span className="skew-x-[20deg]">Input/Output</span>
      </div>
      <div
        className="p-1 border-primary/50 border-2 border-dashed rounded-md cursor-grab text-center bg-card hover:bg-card/90 hover:border-primary transition-colors flex justify-center items-center"
        onDragStart={(event) => onDragStart(event, 'predefinedProcess', 'Sub-routine')}
        draggable
      >
        <div className="border-2 border-transparent w-full h-full p-2">Sub-routine</div>
      </div>
       <div
        className="p-3 border-primary/50 border-2 border-dashed rounded-full cursor-grab text-center bg-card hover:bg-card/90 hover:border-primary transition-colors flex justify-center items-center w-20 h-20 mx-auto"
        onDragStart={(event) => onDragStart(event, 'connector', 'A')}
        draggable
      >
        Connector
      </div>
      <div
        className="p-3 border-primary/50 border-2 border-dashed rounded-md cursor-grab text-center bg-card hover:bg-card/90 hover:border-primary transition-colors flex justify-center items-center"
        onDragStart={(event) => onDragStart(event, 'data', 'Data')}
        draggable
      >
        Data
      </div>
    </aside>
  );
};

const PropertiesPanel = ({ selectedNode, onLabelChange }: { selectedNode: Node | undefined, onLabelChange: (newLabel: string) => void }) => {
  if (!selectedNode) {
    return (
      <div className="border-l-2 p-4 text-sm w-64 bg-background/80 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Click a node to edit its properties.</p>
        </div>
      </div>
    );
  }

  return (
    <aside className="border-l-2 p-4 text-sm w-64 bg-background/80 space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold text-lg text-center">Properties</h3>
        <p className="text-xs text-muted-foreground text-center">Node ID: {selectedNode.id}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="node-label">Label</Label>
        <Input
          id="node-label"
          value={selectedNode.data.label}
          onChange={(e) => onLabelChange(e.target.value)}
          autoComplete="off"
        />
      </div>
    </aside>
  );
};


interface FlowchartEditorProps {
    onChange: (flowData: string) => void;
    initialValue?: string;
}

const DnDFlow = ({ onChange, initialValue }: FlowchartEditorProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const [initialState] = useState(() => {
    if (initialValue && initialValue.length > 2) {
      try {
        const flow = JSON.parse(initialValue);
        if (flow && flow.nodes) {
          return { nodes: flow.nodes, edges: flow.edges || [] };
        }
      } catch (e) {
        console.error("Could not parse initial flowchart data", e);
      }
    }
    return { nodes: initialNodes, edges: initialEdges };
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(initialState.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialState.edges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const selectedNode = useMemo(() => nodes.find((node) => node.selected), [nodes]);

  useEffect(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      onChange(JSON.stringify(flow));
    }
  }, [nodes, edges, reactFlowInstance, onChange]);


  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, type: 'smoothstep' }, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;
      
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/reactflow-label');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { label: `${label}` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  const handleLabelChange = (newLabel: string) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              label: newLabel,
            },
          };
        }
        return node;
      })
    );
  };
  

  return (
    <div className="flex h-[500px] md:h-[600px] border rounded-lg overflow-hidden bg-card">
        <NodePalette />
        <div className="flex-grow h-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
            proOptions={{ hideAttribution: true }}
            className="bg-background"
            nodeTypes={nodeTypes}
          >
            <Controls />
            <Background gap={16} />
          </ReactFlow>
        </div>
        <PropertiesPanel selectedNode={selectedNode} onLabelChange={handleLabelChange} />
    </div>
  );
}

export const FlowchartEditor: React.FC<FlowchartEditorProps> = ({ onChange, initialValue }) => {
    return (
        <ReactFlowProvider>
            <DnDFlow onChange={onChange} initialValue={initialValue} />
        </ReactFlowProvider>
    );
}
