
"use client";

import { ProblemForm } from "@/components/ProblemForm";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function CreateProblemPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="text-center">
           <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
           <p className="mt-4 text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center space-y-2 mb-12">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Create a New Problem ✨</h1>
        <p className="text-muted-foreground">Share a coding challenge with the community. Provide code and generate a flowchart with AI!</p>
      </div>
      <ProblemForm />
    </div>
  );
}
