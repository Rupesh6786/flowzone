
"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
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

const Sidebar = () => {
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
        className="h-28 flex items-center justify-center"
        onDragStart={(event) => onDragStart(event, 'decision', 'Decision')}
        draggable
      >
        <div className="w-20 h-20 flex items-center justify-center transform rotate-45 bg-card hover:bg-card/90 text-center border-primary/50 border-2 border-dashed hover:border-primary transition-colors cursor-grab">
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


interface FlowchartEditorProps {
    onChange: (flowData: string) => void;
}

const DnDFlow = ({ onChange }: FlowchartEditorProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

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
  
  const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
      const newLabel = prompt("Enter new label for the node:", node.data.label);
      if (newLabel !== null && newLabel.trim() !== '') {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === node.id) {
              return {
                ...n,
                data: {
                  ...n.data,
                  label: newLabel,
                },
              };
            }
            return n;
          })
        );
      }
    }, [setNodes]
  );

  return (
    <div className="flex h-[500px] md:h-[600px] border rounded-lg overflow-hidden bg-card" ref={reactFlowWrapper}>
        <Sidebar />
        <div className="flex-grow h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeDoubleClick={onNodeDoubleClick}
            fitView
            proOptions={{ hideAttribution: true }}
            className="bg-background"
            nodeTypes={nodeTypes}
          >
            <Controls />
            <Background gap={16} />
          </ReactFlow>
        </div>
    </div>
  );
}

export const FlowchartEditor: React.FC<FlowchartEditorProps> = ({ onChange }) => {
    return (
        <ReactFlowProvider>
            <DnDFlow onChange={onChange} />
        </ReactFlowProvider>
    );
}
