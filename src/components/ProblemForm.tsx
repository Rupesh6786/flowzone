"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { FlowchartRenderer } from "./FlowchartRenderer";
import { generateFlowchartAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProblemForm() {
  const [flowchart, setFlowchart] = useState("");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
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
      
      let flowchartText = result.flowchart;
      // Sanitize AI output to remove markdown code blocks if they exist
      const mermaidRegex = /```(?:mermaid)?\s*([\s\S]*?)\s*```/;
      const match = flowchartText.match(mermaidRegex);
      if (match && match[1]) {
        flowchartText = match[1].trim();
      }

      setFlowchart(flowchartText);
      toast({
        title: "Flowchart Generated! 🪄",
        description: "The AI has successfully created a flowchart for you.",
      });
    } catch (error) {
      toast({
        title: "AI Error 🤖",
        description: "Could not generate flowchart. Please try a different description.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Problem Submitted! 🎉",
      description: "Thanks for your contribution! Redirecting you home.",
    });
    // In a real app, you would handle form submission to a backend here.
    setTimeout(() => router.push('/'), 1500);
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
            <Input id="title" placeholder="e.g., Two Sum" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the problem, its inputs, and expected outputs."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" placeholder="e.g., array, hash-table, easy (comma-separated)" />
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
            <Input id="c-code" type="file" accept=".c" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpp-code">C++ Code (.cpp)</Label>
            <Input id="cpp-code" type="file" accept=".cpp" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="py-code">Python Code (.py)</Label>
            <Input id="py-code" type="file" accept=".py" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle>AI Flowchart Generator</CardTitle>
          <CardDescription>Use the problem description to automatically generate a flowchart. You can edit the result later.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button type="button" onClick={handleGenerateFlowchart} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Generate with AI
          </Button>
          <div className="p-4 border rounded-lg min-h-[200px] bg-background">
            <FlowchartRenderer chart={flowchart} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg">Submit Problem</Button>
      </div>
    </form>
  );
}
