
"use client";

import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import ReactFlow, { Background, Controls, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { TerminatorNode, ProcessNode, DecisionNode } from './CustomNodes';


const nodeTypes = {
  terminator: TerminatorNode,
  process: ProcessNode,
  decision: DecisionNode,
};

function MermaidRenderer({ chart, getTheme }: { chart: string, getTheme: () => string }) {
    const [svg, setSvg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const renderChart = useCallback(async () => {
        setIsLoading(true);
        try {
            const { default: mermaid } = await import("mermaid");
            mermaid.initialize({
                startOnLoad: false,
                theme: getTheme(),
              });
            const { svg: renderedSvg } = await mermaid.render(`mermaid-svg-${Date.now()}`, chart);
            setSvg(renderedSvg);
            setError(null);
        } catch (e) {
            console.error("Mermaid rendering error:", e);
            setError("Could not render the flowchart. The syntax may be invalid.");
            setSvg(null);
        } finally {
            setIsLoading(false);
        }
    }, [chart, getTheme]);

    useEffect(() => {
        renderChart();
    }, [renderChart]);

    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.attributeName === 'class') {
                    renderChart();
                }
            }
        });
        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, [renderChart]);

    if (error) {
      return (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Flowchart Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (isLoading || !svg) {
      return <Skeleton className="w-full h-64" />;
    }
  
    return (
      <div
        className="w-full flex justify-center flowchart-container"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
}

function ReactFlowRenderer({ chartData }: { chartData: string }) {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    useEffect(() => {
        try {
            const flow = JSON.parse(chartData);
            if (flow && flow.nodes && flow.edges) {
                // Ensure nodes and edges have the correct structure
                const mappedNodes = flow.nodes.map((n: any) => ({ ...n, draggable: false, selectable: false, connectable: false }));
                const mappedEdges = flow.edges.map((e: any) => ({ ...e, selectable: false }));
                setNodes(mappedNodes);
                setEdges(mappedEdges);
            }
        } catch (e) {
            console.error("Failed to parse ReactFlow data", e);
        }
    }, [chartData]);
    
    if (nodes.length === 0) {
        return <Skeleton className="w-full h-64" />;
    }
    
    return (
        <div className="w-full h-[500px] lg:h-[600px] border rounded-lg">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
                proOptions={{ hideAttribution: true }}
                nodesDraggable={false}
                nodesConnectable={false}
                zoomOnScroll={false}
                panOnDrag={false}
                nodeTypes={nodeTypes}
            >
                <Background />
                <Controls showInteractive={false} />
            </ReactFlow>
        </div>
    );
}

export function FlowchartRenderer({ chart }: { chart: string }) {
  const [isReactFlow, setIsReactFlow] = useState(false);
  const [isJsonChecked, setIsJsonChecked] = useState(false);

  const getTheme = useCallback(() => {
    if (typeof window === "undefined") return 'neutral';
    return document.documentElement.classList.contains('dark') ? 'dark' : 'neutral';
  }, []);

  useEffect(() => {
    if (chart && chart.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(chart);
        if (parsed && typeof parsed === 'object' && 'nodes' in parsed && 'edges' in parsed) {
          setIsReactFlow(true);
        } else {
          setIsReactFlow(false);
        }
      } catch (e) {
        setIsReactFlow(false);
      }
    } else {
        setIsReactFlow(false);
    }
    setIsJsonChecked(true);
  }, [chart]);

  if (!chart || chart.trim() === '') {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground bg-muted/50 rounded-lg">
        <p>No flowchart has been created for this problem.</p>
      </div>
    );
  }

  if (!isJsonChecked) {
      return <Skeleton className="w-full h-64" />;
  }

  if (isReactFlow) {
      return <ReactFlowRenderer chartData={chart} />;
  }

  return <MermaidRenderer chart={chart} getTheme={getTheme} />;
}
