
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { handleFileUploadsAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FlowchartEditor } from "./FlowchartEditor";
import type { Problem } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { doc, setDoc, updateDoc, collection, getDoc } from 'firebase/firestore';
import { db } from "@/lib/firebase";

interface ProblemFormProps {
  problem?: Problem;
}

export function ProblemForm({ problem }: ProblemFormProps) {
  const isEditMode = !!problem;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (isEditMode && !authLoading && !user) {
      router.push('/login');
    }
  }, [isEditMode, user, authLoading, router]);

  const [title, setTitle] = useState(problem?.title || "");
  const [description, setDescription] = useState(problem?.description || "");
  const [tags, setTags] = useState(problem?.tags?.join(', ') || "");
  const [flowchartData, setFlowchartData] = useState(problem?.flowchart || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (problem) {
      setTitle(problem.title);
      setDescription(problem.description);
      setTags(problem.tags.join(', '));
      setFlowchartData(problem.flowchart);
    }
  }, [problem]);

  if (isEditMode && (authLoading || !user)) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to perform this action.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const textData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        tags: (formData.get('tags') as string || '').split(',').map(tag => tag.trim()).filter(Boolean),
        flowchart: flowchartData,
    };

    try {
      if (isEditMode && problem) {
        // --- UPDATE LOGIC ---
        const problemId = problem.id;
        
        // Step 1: Handle file uploads on the server
        const fileResult = await handleFileUploadsAction(problemId, formData);
        if (!fileResult.success) {
            throw new Error(fileResult.error || "File upload failed.");
        }

        // Step 2: Prepare data for client-side Firestore update
        const problemRef = doc(db, 'problems', problemId);
        const currentDocSnap = await getDoc(problemRef);
        if (!currentDocSnap.exists()) {
            throw new Error("Problem not found in the database. It might have been deleted.");
        }
        const currentCode = currentDocSnap.data().code || {};
        
        const updateData = {
            ...textData,
            code: {
                ...currentCode,
                ...fileResult.codePaths
            }
        };

        // Step 3: Perform the update from the client (authenticated)
        await updateDoc(problemRef, updateData);

        toast({
          title: 'Problem Updated! 🎉',
          description: 'The problem has been successfully updated.',
        });
        router.push(`/problem/${problemId}`);
        router.refresh();

      } else {
        // --- CREATE LOGIC ---
        // Step 1: Generate a new problem ID on the client
        const newProblemRef = doc(collection(db, 'problems'));
        const problemId = newProblemRef.id;

        // Step 2: Handle file uploads on the server
        const fileResult = await handleFileUploadsAction(problemId, formData);
        if (!fileResult.success) {
            throw new Error(fileResult.error || "File upload failed during creation.");
        }

        // Step 3: Prepare the new problem object
        const newProblem: Problem = {
            id: problemId,
            ...textData,
            code: fileResult.codePaths || {},
            stats: { likes: 0, saves: 0 },
            comments: [],
        };
        
        // Step 4: Create the document from the client (authenticated)
        await setDoc(newProblemRef, newProblem);

        toast({
          title: 'Problem Submitted! 🎉',
          description: 'Redirecting you to the new problem.',
        });
        router.push(`/problem/${problemId}`);
        router.refresh();
      }
    } catch (error: any) {
      toast({
          title: "Operation Failed 😥",
          description: error.message || "An unknown error occurred.",
          variant: "destructive",
      });
    } finally {
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
            <Input id="title" name="title" placeholder="e.g., Two Sum" value={title} onChange={e => setTitle(e.target.value)} required />
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
            <Input id="tags" name="tags" placeholder="e.g., array, hash-table, easy (comma-separated)" value={tags} onChange={e => setTags(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle>Code Solutions</CardTitle>
          <CardDescription>Upload solution files for different languages. Re-upload to overwrite existing files.</CardDescription>
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
            Click a node to select it, then use the Properties panel on the right to edit its label.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FlowchartEditor onChange={setFlowchartData} initialValue={flowchartData} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isSubmitting || authLoading}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? 'Update Problem' : 'Submit Problem'}
        </Button>
      </div>
    </form>
  );
}
