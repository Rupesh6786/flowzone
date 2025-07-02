
'use client';

import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { cn } from '@/lib/utils';

const baseNodeStyles = "bg-card border-2 border-foreground shadow-md text-foreground flex items-center justify-center text-center p-2";

export function TerminatorNode({ data }: NodeProps<{ label: string }>) {
  return (
    <div className={cn(baseNodeStyles, "rounded-full px-6 py-3 min-w-[120px]")}>
      <Handle type="target" position={Position.Top} isConnectable={true} />
      <span className="px-2 break-words">{data.label}</span>
      <Handle type="source" position={Position.Bottom} isConnectable={true} />
    </div>
  );
}

export function ProcessNode({ data }: NodeProps<{ label:string }>) {
  return (
    <div className={cn(baseNodeStyles, "rounded-md px-4 py-2 min-w-[150px] min-h-[50px]")}>
      <Handle type="target" position={Position.Top} id="top-target" isConnectable={true} />
      <span className="px-2 break-words">{data.label}</span>
      <Handle type="source" position={Position.Bottom} id="bottom-source" isConnectable={true} />
      <Handle type="target" position={Position.Left} id="left-target" isConnectable={true} />
      <Handle type="source" position={Position.Right} id="right-source" isConnectable={true} />
    </div>
  );
}

export function DecisionNode({ data }: NodeProps<{ label: string }>) {
  return (
    <div className="relative w-40 h-40 flex items-center justify-center text-center text-foreground shadow-md">
      <svg
        viewBox="0 0 100 100"
        className="absolute w-full h-full"
      >
        <polygon 
          points="50,2 98,50 50,98 2,50"
          fill="hsl(var(--card))"
          stroke="hsl(var(--foreground))"
          strokeWidth="1.5"
        />
      </svg>
      <Handle type="target" position={Position.Top} id="top" isConnectable={true} />
      <div className="relative z-10 max-w-[70%] break-words">{data.label}</div>
      <Handle type="source" position={Position.Right} id="right" isConnectable={true} />
      <Handle type="source" position={Position.Bottom} id="bottom" isConnectable={true} />
      <Handle type="source" position={Position.Left} id="left" isConnectable={true} />
    </div>
  );
}

export function InputOutputNode({ data }: NodeProps<{ label: string }>) {
    return (
      <div className={cn("w-44 min-h-[50px] flex items-center justify-center p-2 -skew-x-[20deg]", baseNodeStyles)}>
        <Handle type="target" position={Position.Top} id="top-target" isConnectable={true} />
        <span className="skew-x-[20deg] break-words">{data.label}</span>
        <Handle type="source" position={Position.Bottom} id="bottom-source" isConnectable={true} />
        <Handle type="target" position={Position.Left} id="left-target" isConnectable={true} />
        <Handle type="source" position={Position.Right} id="right-source" isConnectable={true} />
      </div>
    );
}

export function PredefinedProcessNode({ data }: NodeProps<{ label: string }>) {
    return (
      <div className={cn(baseNodeStyles, "p-1 min-w-[150px] min-h-[50px]")}>
        <Handle type="target" position={Position.Top} id="top-target" isConnectable={true} />
        <div className="border-2 border-foreground w-full h-full flex items-center justify-center px-3 py-1.5">
            <span className="break-words">{data.label}</span>
        </div>
        <Handle type="source" position={Position.Bottom} id="bottom-source" isConnectable={true} />
        <Handle type="target" position={Position.Left} id="left-target" isConnectable={true} />
        <Handle type="source" position={Position.Right} id="right-source" isConnectable={true} />
      </div>
    );
}

export function ConnectorNode({ data }: NodeProps<{ label: string }>) {
    return (
      <div className={cn(baseNodeStyles, "rounded-full w-20 h-20")}>
        <Handle type="target" position={Position.Top} id="top-target" isConnectable={true} />
        <span className="break-words">{data.label}</span>
        <Handle type="source" position={Position.Bottom} id="bottom-source" isConnectable={true} />
        <Handle type="target" position={Position.Left} id="left-target" isConnectable={true} />
        <Handle type="source" position={Position.Right} id="right-source" isConnectable={true} />
      </div>
    );
}

export function DataNode({ data }: NodeProps<{ label: string }>) {
  return (
    <div className="relative w-40 h-24 flex items-center justify-center text-foreground">
      <div className="absolute inset-0 bg-card -z-10"></div>
      <svg viewBox="0 0 100 80" className="absolute w-full h-full" fill="transparent" stroke="currentColor" strokeWidth="3">
          <path d="M98,20 V60 C98,71.045695 2,71.045695 2,60 V20" />
          <path d="M2,20 C2,8.954305 98,8.954305 98,20" />
      </svg>
      <div className="relative break-words max-w-[80%] text-center p-2">
          {data.label}
      </div>
      <Handle type="target" position={Position.Top} id="top-target" isConnectable={true} />
      <Handle type="source" position={Position.Bottom} id="bottom-source" isConnectable={true} />
      <Handle type="target" position={Position.Left} id="left-target" isConnectable={true} />
      <Handle type="source" position={Position.Right} id="right-source" isConnectable={true} />
    </div>
  );
}

export function LabelNode({ data }: NodeProps<{ label: string }>) {
  return (
    <div className="text-foreground text-center break-words p-2 rounded-md bg-transparent border-2 border-dashed border-foreground/50 min-w-[100px]">
        <span className="px-2">{data.label}</span>
    </div>
  );
}
