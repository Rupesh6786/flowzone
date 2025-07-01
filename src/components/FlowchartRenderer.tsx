"use client";

import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export function FlowchartRenderer({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getTheme = useCallback(() => {
    if (typeof window === "undefined") return 'neutral';
    return document.documentElement.classList.contains('dark') ? 'dark' : 'neutral';
  }, []);

  const renderChart = useCallback(async () => {
    if (!chart) {
      setSvg(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { default: mermaid } = await import("mermaid");
      mermaid.initialize({
        startOnLoad: false,
        theme: getTheme(),
      });
      // The ID needs to be unique for each render.
      const { svg: renderedSvg } = await mermaid.render(`mermaid-svg-${Date.now()}`, chart);
      setSvg(renderedSvg);
      setError(null);
    } catch (e) {
      console.error("Mermaid rendering error:", e);
      setError("Could not render the flowchart. Please check the syntax.");
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
          // Re-render the chart on theme change
          renderChart();
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      observer.disconnect();
    };
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
  
  if (!chart && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Flowchart will appear here once generated.</p>
      </div>
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
