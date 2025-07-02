'use client';

import type { NodeProps } from 'reactflow';
import { Handle, Position, useReactFlow } from 'reactflow';
import { cn } from '@/lib/utils';
import { Pencil } from 'lucide-react';

const baseNodeStyles = "bg-card border-2 border-foreground shadow-md text-foreground flex items-center justify-center text-center p-2";

export function TerminatorNode({ id, data }: NodeProps<{ label: string }>) {
  const { setNodes } = useReactFlow();
  const handleEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const newLabel = prompt("Enter new label for the node:", data.label);
    if (newLabel !== null && newLabel.trim() !== '') {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return { ...node, data: { ...node.data, label: newLabel } };
          }
          return node;
        })
      );
    }
  };

  return (
    <div className={cn(baseNodeStyles, "rounded-full px-6 py-3 min-w-[120px] group relative")}>
      <button 
        type="button"
        onClick={handleEdit}
        className="absolute top-1 right-1 p-1 rounded-full bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-accent"
        aria-label="Edit node"
      >
        <Pencil className="w-3 h-3" />
      </button>
      <Handle type="target" position={Position.Top} isConnectable={true} />
      <span className="px-2 break-words">{data.label}</span>
      <Handle type="source" position={Position.Bottom} isConnectable={true} />
    </div>
  );
}

export function ProcessNode({ id, data }: NodeProps<{ label:string }>) {
  const { setNodes } = useReactFlow();
  const handleEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const newLabel = prompt("Enter new label for the node:", data.label);
    if (newLabel !== null && newLabel.trim() !== '') {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return { ...node, data: { ...node.data, label: newLabel } };
          }
          return node;
        })
      );
    }
  };

  return (
    <div className={cn(baseNodeStyles, "rounded-md px-4 py-2 min-w-[150px] min-h-[50px] group relative")}>
      <button 
        type="button"
        onClick={handleEdit}
        className="absolute top-1 right-1 p-1 rounded-full bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-accent"
        aria-label="Edit node"
      >
        <Pencil className="w-3 h-3" />
      </button>
      <Handle type="target" position={Position.Top} isConnectable={true} />
      <span className="px-2 break-words">{data.label}</span>
      <Handle type="source" position={Position.Bottom} isConnectable={true} />
      <Handle type="target" position={Position.Left} isConnectable={true} />
      <Handle type="source" position={Position.Right} isConnectable={true} />
    </div>
  );
}

export function DecisionNode({ id, data }: NodeProps<{ label: string }>) {
  const { setNodes } = useReactFlow();
  const handleEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const newLabel = prompt("Enter new label for the node:", data.label);
    if (newLabel !== null && newLabel.trim() !== '') {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return { ...node, data: { ...node.data, label: newLabel } };
          }
          return node;
        })
      );
    }
  };

  return (
    <div 
      className={cn(baseNodeStyles, "w-40 h-40 group relative")}
      style={{ clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)' }}
    >
      <button 
        type="button"
        onClick={handleEdit}
        className="absolute top-3 right-[2.2rem] p-1 rounded-full bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-accent"
        aria-label="Edit node"
      >
        <Pencil className="w-3 h-3" />
      </button>
      <Handle type="target" position={Position.Top} id="top" isConnectable={true} />
      <div className="max-w-[80%] break-words">{data.label}</div>
      <Handle type="source" position={Position.Right} id="right" isConnectable={true} />
      <Handle type="source" position={Position.Bottom} id="bottom" isConnectable={true} />
      <Handle type="target" position={Position.Left} id="left" isConnectable={true} />
    </div>
  );
}

export function InputOutputNode({ id, data }: NodeProps<{ label: string }>) {
    const { setNodes } = useReactFlow();
    const handleEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        const newLabel = prompt("Enter new label for the node:", data.label);
        if (newLabel !== null && newLabel.trim() !== '') {
            setNodes((nodes) =>
                nodes.map((node) => {
                    if (node.id === id) {
                        return { ...node, data: { ...node.data, label: newLabel } };
                    }
                    return node;
                })
            );
        }
    };

    return (
      <div className={cn("w-44 min-h-[50px] flex items-center justify-center p-2 -skew-x-[20deg] group relative", baseNodeStyles)}>
        <button 
          type="button"
          onClick={handleEdit}
          className="absolute top-1 right-1 p-1 rounded-full bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-accent skew-x-[20deg]"
          aria-label="Edit node"
        >
          <Pencil className="w-3 h-3" />
        </button>
        <Handle type="target" position={Position.Top} isConnectable={true} />
        <span className="skew-x-[20deg] break-words">{data.label}</span>
        <Handle type="source" position={Position.Bottom} isConnectable={true} />
        <Handle type="target" position={Position.Left} isConnectable={true} />
        <Handle type="source" position={Position.Right} isConnectable={true} />
      </div>
    );
}

export function PredefinedProcessNode({ id, data }: NodeProps<{ label: string }>) {
    const { setNodes } = useReactFlow();
    const handleEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        const newLabel = prompt("Enter new label for the node:", data.label);
        if (newLabel !== null && newLabel.trim() !== '') {
            setNodes((nodes) =>
                nodes.map((node) => {
                    if (node.id === id) {
                        return { ...node, data: { ...node.data, label: newLabel } };
                    }
                    return node;
                })
            );
        }
    };

    return (
        <div className={cn(baseNodeStyles, "p-1 min-w-[150px] min-h-[50px] group relative")}>
            <button 
                type="button"
                onClick={handleEdit}
                className="absolute top-1 right-1 p-1 rounded-full bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-accent"
                aria-label="Edit node"
            >
                <Pencil className="w-3 h-3" />
            </button>
            <Handle type="target" position={Position.Top} isConnectable={true} />
            <div className="border-2 border-foreground w-full h-full flex items-center justify-center px-3 py-1.5">
                <span className="break-words">{data.label}</span>
            </div>
            <Handle type="source" position={Position.Bottom} isConnectable={true} />
            <Handle type="target" position={Position.Left} isConnectable={true} />
            <Handle type="source" position={Position.Right} isConnectable={true} />
        </div>
    );
}

export function ConnectorNode({ id, data }: NodeProps<{ label: string }>) {
    const { setNodes } = useReactFlow();
    const handleEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        const newLabel = prompt("Enter new label for the node:", data.label);
        if (newLabel !== null && newLabel.trim() !== '') {
            setNodes((nodes) =>
                nodes.map((node) => {
                    if (node.id === id) {
                        return { ...node, data: { ...node.data, label: newLabel } };
                    }
                    return node;
                })
            );
        }
    };

    return (
        <div className={cn(baseNodeStyles, "rounded-full w-20 h-20 group relative")}>
            <button 
                type="button"
                onClick={handleEdit}
                className="absolute top-1 right-1 p-1 rounded-full bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-accent"
                aria-label="Edit node"
            >
                <Pencil className="w-3 h-3" />
            </button>
            <Handle type="target" position={Position.Top} isConnectable={true} />
            <span className="break-words">{data.label}</span>
            <Handle type="source" position={Position.Bottom} isConnectable={true} />
            <Handle type="target" position={Position.Left} isConnectable={true} />
            <Handle type="source" position={Position.Right} isConnectable={true} />
        </div>
    );
}

export function DataNode({ id, data }: NodeProps<{ label: string }>) {
  const { setNodes } = useReactFlow();
  const handleEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const newLabel = prompt("Enter new label for the node:", data.label);
    if (newLabel !== null && newLabel.trim() !== '') {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return { ...node, data: { ...node.data, label: newLabel } };
          }
          return node;
        })
      );
    }
  };

  return (
    <div className="relative w-40 h-24 flex items-center justify-center text-foreground group">
      <button 
        type="button"
        onClick={handleEdit}
        className="absolute top-1 right-1 p-1 rounded-full bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-accent"
        aria-label="Edit node"
      >
          <Pencil className="w-3 h-3" />
      </button>
      <div className="absolute inset-0 bg-card -z-10"></div>
      <svg viewBox="0 0 100 80" className="absolute w-full h-full" fill="transparent" stroke="currentColor" strokeWidth="3">
          <path d="M98,20 V60 C98,71.045695 2,71.045695 2,60 V20" />
          <path d="M2,20 C2,8.954305 98,8.954305 98,20" />
      </svg>
      <div className="relative break-words max-w-[80%] text-center p-2">
          {data.label}
      </div>
      <Handle type="target" position={Position.Top} isConnectable={true} />
      <Handle type="source" position={Position.Bottom} isConnectable={true} />
      <Handle type="target" position={Position.Left} isConnectable={true} />
      <Handle type="source"
position={Position.Right} isConnectable={true} />
    </div>
  );
}
