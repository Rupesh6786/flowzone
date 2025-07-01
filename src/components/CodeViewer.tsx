import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type CodeProps = {
  code: {
    c?: string;
    cpp?: string;
    py?: string;
  }
}

export function CodeViewer({ code }: CodeProps) {
  const availableLanguages = Object.keys(code).filter(lang => !!code[lang as keyof typeof code]);

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
          <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-code">
            <code>{code.c.trim()}</code>
          </pre>
        </TabsContent>
      )}
      {code.cpp && (
        <TabsContent value="cpp">
          <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-code">
            <code>{code.cpp.trim()}</code>
          </pre>
        </TabsContent>
      )}
      {code.py && (
        <TabsContent value="py">
          <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-code">
            <code>{code.py.trim()}</code>
          </pre>
        </TabsContent>
      )}
    </Tabs>
  )
}
