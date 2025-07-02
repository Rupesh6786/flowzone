
'use client';

import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { cn } from '@/lib/utils';

// Base styles for all nodes to keep them consistent
const baseNodeStyles = "bg-card border-2 border-foreground shadow-md text-foreground flex items-center justify-center text-center";

// Terminator Node (Oval)
export function TerminatorNode({ data }: NodeProps<{ label: string }>) {
  return (
    <div className={cn(baseNodeStyles, "rounded-full px-6 py-3 min-w-[120px]")}>
      <Handle type="target" position={Position.Top} isConnectable={true} />
      <span className="px-2">{data.label}</span>
      <Handle type="source" position={Position.Bottom} isConnectable={true} />
    </div>
  );
}

// Process Node (Rectangle)
export function ProcessNode({ data }: NodeProps<{ label: string }>) {
  return (
    <div className={cn(baseNodeStyles, "rounded-md px-4 py-2 min-w-[150px] min-h-[50px]")}>
      <Handle type="target" position={Position.Top} isConnectable={true} />
        <span className="px-2">{data.label}</span>
      <Handle type="source" position={Position.Bottom} isConnectable={true} />
    </div>
  );
}

// Decision Node (Diamond)
export function DecisionNode({ data }: NodeProps<{ label: string }>) {
  return (
    <div 
      className={cn(baseNodeStyles, "w-40 h-40")}
      style={{ clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)' }}
    >
      <Handle type="target" position={Position.Top} id="top" isConnectable={true} />
      <Handle type="target" position={Position.Left} id="left" isConnectable={true} />
      <div className="max-w-[80%] break-words">{data.label}</div>
      <Handle type="source" position={Position.Right} id="right" isConnectable={true} />
      <Handle type="source" position={Position.Bottom} id="bottom" isConnectable={true} />
    </div>
  );
}
