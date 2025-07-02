
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { createProblemAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FlowchartEditor } from "./FlowchartEditor";

export function ProblemForm() {
  const [description, setDescription] = useState("");
  const [flowchartData, setFlowchartData] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append('flowchart', flowchartData);
    formData.set('description', description);

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
          <CardDescription>
            Build your flowchart by dragging components from the sidebar. Connect nodes by dragging from one handle to another.
            <br />
            <strong>To edit a node's text, hover over it and click the pencil icon.</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FlowchartEditor onChange={setFlowchartData} />
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
