"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCodeContentAction } from "@/app/actions";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";

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

    useEffect(() => {
        const fetchCode = async () => {
            if (!path) return;
            setIsLoading(true);
            const content = await getCodeContentAction(path);
            setCode(content);
            setIsLoading(false);
        }
        fetchCode();
    }, [path]);

    if (isLoading) {
        return <Skeleton className="h-48 w-full" />
    }

    if (!code) {
        return <p>Could not load code.</p>
    }

    return (
        <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-code">
            <code>{code.trim()}</code>
        </pre>
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
