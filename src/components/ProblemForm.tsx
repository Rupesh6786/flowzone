
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { FlowchartRenderer } from "./FlowchartRenderer";
import { createProblemAction, generateFlowchartAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProblemForm() {
  const [flowchart, setFlowchart] = useState("");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleGenerateFlowchart = async () => {
    if (!description) {
      toast({
        title: "Uh oh! 😥",
        description: "Please enter a problem description to generate a flowchart.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateFlowchartAction(description);
      setFlowchart(result.flowchart);
      toast({
        title: "Flowchart Generated! 🪄",
        description: "The AI has created a starting point for your flowchart.",
      });
    } catch (error: any) {
      toast({
        title: "AI Error 🤖",
        description: error.message || "Could not generate flowchart. Please try a different description.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append('flowchart', flowchart);
    formData.set('description', description); // Use set to ensure latest value from state is used

    const result = await createProblemAction(formData);

    if (result.success && result.problemId) {
      toast({
        title: "Problem Submitted! 🎉",
        description: "Thanks for your contribution! Redirecting you to the new problem.",
      });
      router.push(`/problem/${result.problemId}`);
    } else {
      toast({
        title: "Submission Error 😥",
        description: result.error || "An unknown error occurred.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle>Problem Details</CardTitle>
          <CardDescription>Enter the core information for your coding problem.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Problem Title</Label>
            <Input id="title" name="title" placeholder="e.g., Two Sum" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the problem, its inputs, and expected outputs."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" name="tags" placeholder="e.g., array, hash-table, easy (comma-separated)" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle>Code Solutions</CardTitle>
          <CardDescription>Upload solution files for different languages.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="c-code">C Code (.c)</Label>
            <Input id="c-code" name="c-code" type="file" accept=".c" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpp-code">C++ Code (.cpp)</Label>
            <Input id="cpp-code" name="cpp-code" type="file" accept=".cpp" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="py-code">Python Code (.py)</Label>
            <Input id="py-code" name="py-code" type="file" accept=".py" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle>Flowchart Editor</CardTitle>
          <CardDescription>Generate a flowchart with AI from your description, then edit the Mermaid.js code manually for a perfect result.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button type="button" onClick={handleGenerateFlowchart} disabled={isGenerating || !description}>
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Generate with AI
          </Button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="flowchart-code">Mermaid Code</Label>
              <Textarea
                id="flowchart-code"
                value={flowchart}
                onChange={(e) => setFlowchart(e.target.value)}
                placeholder={"graph TD\n  A([Start]) --> B{Is it... ?};\n  B -- Yes --> C[Do this];\n  B -- No --> D[Do that];"}
                rows={12}
                className="font-code text-sm"
              />
               <p className="text-xs text-muted-foreground">
                Use valid Mermaid.js syntax. For node text, prefer words (e.g., "Increment i") over symbols (e.g., "i++").
              </p>
            </div>
            <div className="space-y-2">
              <Label>Live Preview</Label>
              <div className="p-4 border rounded-lg min-h-[290px] bg-background overflow-auto flex items-center justify-center">
                <FlowchartRenderer chart={flowchart} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Problem
        </Button>
      </div>
    </form>
  );
}
