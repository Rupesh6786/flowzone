"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const MERMAID_SCRIPT_ID = "mermaid-script-loader";

// Updated MermaidAPI interface to reflect v10 API
interface MermaidAPI {
  initialize: (config: any) => void;
  run: (options?: { nodes: Array<Element>; suppressErrors?: boolean }) => Promise<void>;
  render: (id: string, source: string) => Promise<{ svg: string, bindFunctions?: (element: Element) => void }>;
}

declare global {
  interface Window {
    mermaid?: MermaidAPI;
  }
}

export function FlowchartRenderer({ chart }: { chart: string }) {
  const [isMermaidReady, setIsMermaidReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    const loadMermaid = () => {
      if (window.mermaid) {
        setIsMermaidReady(true);
        return;
      }

      if (document.getElementById(MERMAID_SCRIPT_ID)) {
        const checkReady = setInterval(() => {
          if(window.mermaid) {
            setIsMermaidReady(true);
            clearInterval(checkReady);
          }
        }, 100);
        return;
      }
      
      const script = document.createElement("script");
      script.id = MERMAID_SCRIPT_ID;
      script.src = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
      script.onload = () => {
        const isDarkMode = document.documentElement.classList.contains('dark');
        window.mermaid?.initialize({ startOnLoad: false, theme: isDarkMode ? 'dark' : 'neutral' });
        setIsMermaidReady(true);
      };
      script.onerror = () => {
        setError("Failed to load Mermaid.js script.");
      };
      document.body.appendChild(script);
    };
    
    loadMermaid();
  }, []);
  
  useEffect(() => {
    if (isMermaidReady && chart) {
      setError(null);
      setSvg(null); // Clear previous SVG

      const renderChart = async () => {
        try {
          // Use a unique ID for each render to avoid conflicts
          const uniqueId = `mermaid-svg-${Date.now()}-${Math.random()}`;
          const { svg: renderedSvg } = await window.mermaid!.render(uniqueId, chart);
          setSvg(renderedSvg);
        } catch (e) {
          console.error("Mermaid rendering error:", e);
          setError("Could not render the flowchart. Please check the syntax.");
        }
      };

      renderChart();
    }
  }, [isMermaidReady, chart]);

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Flowchart Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  if (!chart) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Flowchart will appear here once generated.</p>
      </div>
    );
  }

  // Show skeleton while rendering
  if (!isMermaidReady || !svg) {
    return <Skeleton className="w-full h-64" />;
  }

  // Render the generated SVG
  return (
    <div
      className="w-full flex justify-center flowchart-container"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
