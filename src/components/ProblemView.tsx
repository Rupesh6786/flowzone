
"use client";

import type { Problem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { CodeViewer } from "@/components/CodeViewer";
import { FlowchartRenderer } from "@/components/FlowchartRenderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Bookmark, Share2, Code2, Copy, Loader2, Pencil } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { CommentsSection } from "./CommentsSection";
import { updateProblemStatsAction } from "@/app/actions";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface ProblemViewProps {
  problem: Problem;
}

export function ProblemView({ problem }: ProblemViewProps) {
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState("");
  const [stats, setStats] = useState(problem.stats);
  const [isUpdating, setIsUpdating] = useState<"likes" | "saves" | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, []);

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: "Link Copied! 📋",
        description: "The problem link is now in your clipboard.",
      });
    });
  };

  const handleStatUpdate = async (stat: "likes" | "saves") => {
    if (isUpdating) return;
    setIsUpdating(stat);

    setStats((prev) => ({ ...prev, [stat]: prev[stat] + 1 }));

    const result = await updateProblemStatsAction(problem.id, stat);

    if (!result.success) {
      setStats((prev) => ({ ...prev, [stat]: prev[stat] - 1 }));
      toast({
        title: "Error",
        description: result.error || "Could not update count. Please try again.",
        variant: "destructive",
      });
    }
    
    if (result.success) {
      // Keep button disabled for the session to prevent spam
    } else {
       setIsUpdating(null);
    }
  };
  
  return (
    <div className="space-y-12">
      <section>
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tighter">{problem.title}</h1>
          <p className="text-lg text-muted-foreground">{problem.description}</p>
          <div className="flex flex-wrap gap-2">
            {problem.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </div>
        <div className="mt-6 flex items-center space-x-4">
          <Button variant="outline" onClick={() => handleStatUpdate('likes')} disabled={isUpdating === 'likes'}>
            {isUpdating === 'likes' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Heart className="mr-2 h-4 w-4" />
            )}
            Like ({stats.likes})
          </Button>
          <Button variant="outline" onClick={() => handleStatUpdate('saves')} disabled={isUpdating === 'saves'}>
             {isUpdating === 'saves' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Bookmark className="mr-2 h-4 w-4" />
            )}
            Save ({stats.saves})
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-96">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Share Problem</h4>
                  <p className="text-sm text-muted-foreground">
                    Anyone with this link can view this problem.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="h-9 flex-1"
                  />
                  <Button variant="secondary" size="icon" className="h-9 w-9 shrink-0" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy link</span>
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {user && (
            <Link href={`/problem/${problem.id}/edit`}>
              <Button>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Problem
              </Button>
            </Link>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Code2 /> Code Solutions</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeViewer code={problem.code} />
            </CardContent>
          </Card>

          <Card className="bg-card/60">
            <CardHeader>
              <CardTitle>📊 Flowchart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-lg bg-background">
                <FlowchartRenderer chart={problem.flowchart} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <CommentsSection problemId={problem.id} initialComments={problem.comments} />
        </div>
      </div>
    </div>
  );
}
