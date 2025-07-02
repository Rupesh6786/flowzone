
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { Copy, Check } from "lucide-react";

type CodeProps = {
  code: {
    c?: string;
    cpp?: string;
    py?: string;
  }
}

function CodeDisplay({ path }: { path: string }) {
    const [code, setCode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCopied, setIsCopied] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchCode = async () => {
            if (!path) return;
            setIsLoading(true);
            try {
                const response = await fetch(path);
                 if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const content = await response.text();
                setCode(content);
            } catch (error) {
                 console.error("Failed to fetch code:", error);
                 setCode(`// Error loading code from ${path}`);
            }
            finally {
                setIsLoading(false);
            }
        }
        fetchCode();
    }, [path]);
    
    const handleCopy = () => {
        if (!code) return;
        navigator.clipboard.writeText(code.trim()).then(() => {
            toast({ title: "Code Copied!" });
            setIsCopied(true);
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            toast({ title: "Failed to copy", variant: "destructive" });
        });
    };


    if (isLoading) {
        return <Skeleton className="h-48 w-full" />
    }

    if (!code) {
        return <p>Could not load code.</p>
    }

    return (
        <div className="relative group">
            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-code">
                <code>{code.trim()}</code>
            </pre>
            <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleCopy}
            >
                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copy code</span>
            </Button>
        </div>
    );
}


export function CodeViewer({ code }: CodeProps) {
  const availableLanguages = Object.entries(code)
    .filter(([, path]) => !!path)
    .map(([lang]) => lang);

  if (availableLanguages.length === 0) {
    return (
      <div className="flex items-center justify-center text-muted-foreground p-8 border rounded-lg">
        No code solutions available for this problem yet.
      </div>
    );
  }

  return (
    <Tabs defaultValue={availableLanguages[0]} className="w-full">
      <TabsList>
        {code.c && <TabsTrigger value="c">C</TabsTrigger>}
        {code.cpp && <TabsTrigger value="cpp">C++</TabsTrigger>}
        {code.py && <TabsTrigger value="py">Python</TabsTrigger>}
      </TabsList>
      
      {code.c && (
        <TabsContent value="c">
            <CodeDisplay path={code.c} />
        </TabsContent>
      )}
      {code.cpp && (
        <TabsContent value="cpp">
            <CodeDisplay path={code.cpp} />
        </TabsContent>
      )}
      {code.py && (
        <TabsContent value="py">
            <CodeDisplay path={code.py} />
        </TabsContent>
      )}
    </Tabs>
  )
}
