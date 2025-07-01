"use client";

import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const MERMAID_SCRIPT_ID = "mermaid-script-loader";

interface MermaidAPI {
  initialize: (config: any) => void;
  run: (options?: { nodes: Array<Element>; suppressErrors?: boolean }) => Promise<void>;
}

declare global {
  interface Window {
    mermaid?: MermaidAPI;
  }
}

export function FlowchartRenderer({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMermaidReady, setIsMermaidReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (isMermaidReady && containerRef.current && chart) {
      setError(null);
      try {
        containerRef.current.innerHTML = chart;
        containerRef.current.removeAttribute("data-processed");
        window.mermaid?.run({ nodes: [containerRef.current] }).catch(err => {
            console.error("Mermaid rendering error:", err);
            setError("Could not render the flowchart. Please check the syntax.");
        });
      } catch (e: any) {
        console.error("Error rendering flowchart:", e);
        setError(e.message || "An unknown error occurred during rendering.");
      }
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

  if (!isMermaidReady) {
    return <Skeleton className="w-full h-64" />;
  }

  return <div ref={containerRef} key={chart} className="mermaid w-full flex justify-center flowchart-container" />;
}
