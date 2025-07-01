
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { FlowchartRenderer } from "./FlowchartRenderer";
import { createProblemAction, generatePseudocodeAction, generateFlowchartFromPseudocodeAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bot, BrainCircuit } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProblemForm() {
  const [description, setDescription] = useState("");
  const [pseudocode, setPseudocode] = useState("");
  const [flowchart, setFlowchart] = useState("");

  const [isGeneratingPseudocode, setIsGeneratingPseudocode] = useState(false);
  const [isGeneratingFlowchart, setIsGeneratingFlowchart] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleGeneratePseudocode = async () => {
    if (!description) {
      toast({
        title: "Uh oh! 😥",
        description: "Please enter a problem description to generate pseudocode.",
        variant: "destructive",
      });
      return;
    }
    setIsGeneratingPseudocode(true);
    try {
      const result = await generatePseudocodeAction(description);
      setPseudocode(result.pseudocode);
      toast({
        title: "Pseudocode Generated! 📝",
        description: "The AI has created a starting point. Feel free to edit it before creating the flowchart.",
      });
    } catch (error: any) {
      toast({
        title: "AI Error 🤖",
        description: error.message || "Could not generate pseudocode. Please try a different description.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPseudocode(false);
    }
  };

  const handleGenerateFlowchart = async () => {
    if (!pseudocode) {
      toast({
        title: "Uh oh! 😥",
        description: "Please generate or write some pseudocode first.",
        variant: "destructive",
      });
      return;
    }
    setIsGeneratingFlowchart(true);
    try {
      const result = await generateFlowchartFromPseudocodeAction(pseudocode);
      setFlowchart(result.flowchart);
      toast({
        title: "Flowchart Generated! 🪄",
        description: "The AI has turned your pseudocode into a flowchart.",
      });
    } catch (error: any) {
      toast({
        title: "AI Error 🤖",
        description: error.message || "Could not generate flowchart. Please check your pseudocode and try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingFlowchart(false);
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
          <CardTitle>Flowchart Generator</CardTitle>
          <CardDescription>Generate a flowchart in two steps: first create pseudocode from your description, then convert it to a visual flowchart.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex justify-between items-center">
                <Label htmlFor="pseudocode-code" className="text-lg font-semibold">Step 1: Edit Pseudocode</Label>
                <Button type="button" onClick={handleGeneratePseudocode} disabled={isGeneratingPseudocode || !description}>
                  {isGeneratingPseudocode ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Bot className="mr-2 h-4 w-4" />
                  )}
                  Generate with AI
                </Button>
            </div>
            <Textarea
              id="pseudocode-code"
              value={pseudocode}
              onChange={(e) => setPseudocode(e.target.value)}
              placeholder={"Generate pseudocode from your description above, or write your own here.\n\nExample:\nSTART\n  INPUT name\n  OUTPUT \"Hello, \" + name\nEND"}
              rows={10}
              className="font-code text-sm"
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold">Step 2: Generate Flowchart</Label>
                 <Button type="button" onClick={handleGenerateFlowchart} disabled={isGeneratingFlowchart || !pseudocode}>
                  {isGeneratingFlowchart ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <BrainCircuit className="mr-2 h-4 w-4" />
                  )}
                  Generate Flowchart
                </Button>
            </div>
            <div className="p-4 border rounded-lg min-h-[290px] bg-background overflow-auto flex items-center justify-center">
              <FlowchartRenderer chart={flowchart} />
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
