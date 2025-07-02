
'use client';

import type { NodeProps } from 'reactflow';
import { Handle, Position, useReactFlow } from 'reactflow';
import { cn } from '@/lib/utils';
import { Pencil } from 'lucide-react';

const baseNodeStyles = "bg-card border-2 border-foreground shadow-md text-foreground flex items-center justify-center text-center p-2";

function BaseNode({ id, data, children, className, ...props }: React.PropsWithChildren<NodeProps<{ label: string }>> & { className?: string }) {
  const { setNodes } = useReactFlow();

  const handleEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Stop the event from propagating to the parent node, which would
    // trigger React Flow's drag behavior and prevent the click.
    event.stopPropagation();

    const newLabel = prompt("Enter new label for the node:", data.label);

    // prompt() returns null if the user clicks "Cancel".
    // We only update if the user provides a new, non-empty value.
    if (newLabel !== null && newLabel.trim() !== '') {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            // This is the critical part. We must return a *new* object
            // for React to detect the change and re-render the node.
            // Mutating node.data directly will not work.
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
    }
  };

  return (
    <div className={cn(className, "group relative")}>
      <button 
        type="button"
        onClick={handleEdit}
        className={cn(
          "absolute p-1 rounded-full bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-accent",
          props.editIconClassName // Allow custom positioning for each shape
        )}
        aria-label="Edit node"
      >
        <Pencil className="w-3 h-3" />
      </button>
      {children}
    </div>
  );
}


export function TerminatorNode({ id, data }: NodeProps<{ label: string }>) {
  return (
    <BaseNode id={id} data={data} className={cn(baseNodeStyles, "rounded-full px-6 py-3 min-w-[120px]")} editIconClassName="top-1 right-1">
      <Handle type="target" position={Position.Top} isConnectable={true} />
      <span className="px-2 break-words">{data.label}</span>
      <Handle type="source" position={Position.Bottom} isConnectable={true} />
    </BaseNode>
  );
}

export function ProcessNode({ id, data }: NodeProps<{ label:string }>) {
  return (
    <BaseNode id={id} data={data} className={cn(baseNodeStyles, "rounded-md px-4 py-2 min-w-[150px] min-h-[50px]")} editIconClassName="top-1 right-1">
      <Handle type="target" position={Position.Top} isConnectable={true} />
      <span className="px-2 break-words">{data.label}</span>
      <Handle type="source" position={Position.Bottom} isConnectable={true} />
      <Handle type="target" position={Position.Left} isConnectable={true} />
      <Handle type="source" position={Position.Right} isConnectable={true} />
    </BaseNode>
  );
}

export function DecisionNode({ id, data }: NodeProps<{ label: string }>) {
  return (
    <BaseNode 
      id={id} 
      data={data} 
      className={cn(baseNodeStyles, "w-40 h-40")} 
      style={{ clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)' }}
      editIconClassName="top-3 right-[2.2rem]"
    >
      <Handle type="target" position={Position.Top} id="top" isConnectable={true} />
      <div className="max-w-[80%] break-words">{data.label}</div>
      <Handle type="source" position={Position.Right} id="right" isConnectable={true} />
      <Handle type="source" position={Position.Bottom} id="bottom" isConnectable={true} />
      <Handle type="target" position={Position.Left} id="left" isConnectable={true} />
    </BaseNode>
  );
}

export function InputOutputNode({ id, data }: NodeProps<{ label: string }>) {
    return (
      <BaseNode 
        id={id} 
        data={data} 
        className={cn("w-44 min-h-[50px] flex items-center justify-center p-2 -skew-x-[20deg]", baseNodeStyles)}
        editIconClassName="top-1 right-1 skew-x-[20deg]"
      >
        <Handle type="target" position={Position.Top} isConnectable={true} />
        <span className="skew-x-[20deg] break-words">{data.label}</span>
        <Handle type="source" position={Position.Bottom} isConnectable={true} />
        <Handle type="target" position={Position.Left} isConnectable={true} />
        <Handle type="source" position={Position.Right} isConnectable={true} />
      </BaseNode>
    );
}

export function PredefinedProcessNode({ id, data }: NodeProps<{ label: string }>) {
    return (
      <BaseNode 
        id={id} 
        data={data} 
        className={cn(baseNodeStyles, "p-1 min-w-[150px] min-h-[50px]")}
        editIconClassName="top-1 right-1"
      >
        <Handle type="target" position={Position.Top} isConnectable={true} />
        <div className="border-2 border-foreground w-full h-full flex items-center justify-center px-3 py-1.5">
            <span className="break-words">{data.label}</span>
        </div>
        <Handle type="source" position={Position.Bottom} isConnectable={true} />
        <Handle type="target" position={Position.Left} isConnectable={true} />
        <Handle type="source" position={Position.Right} isConnectable={true} />
      </BaseNode>
    );
}

export function ConnectorNode({ id, data }: NodeProps<{ label: string }>) {
    return (
      <BaseNode 
        id={id} 
        data={data} 
        className={cn(baseNodeStyles, "rounded-full w-20 h-20")}
        editIconClassName="top-1 right-1"
      >
        <Handle type="target" position={Position.Top} isConnectable={true} />
        <span className="break-words">{data.label}</span>
        <Handle type="source" position={Position.Bottom} isConnectable={true} />
        <Handle type="target" position={Position.Left} isConnectable={true} />
        <Handle type="source" position={Position.Right} isConnectable={true} />
      </BaseNode>
    );
}

export function DataNode({ id, data }: NodeProps<{ label: string }>) {
  return (
    <BaseNode 
      id={id} 
      data={data} 
      className="relative w-40 h-24 flex items-center justify-center text-foreground"
      editIconClassName="top-1 right-1"
    >
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
      <Handle type="source" position={Position.Right} isConnectable={true} />
    </BaseNode>
  );
}
