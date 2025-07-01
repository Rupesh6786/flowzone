"use client";

import type { Problem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { CodeViewer } from "@/components/CodeViewer";
import { FlowchartRenderer } from "@/components/FlowchartRenderer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Bookmark, MessageCircle, Share2, Code2, Copy } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface ProblemViewProps {
  problem: Problem;
}

export function ProblemView({ problem }: ProblemViewProps) {
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState("");

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
  
  return (
    <div className="space-y-12">
      {/* Header Section */}
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
          <Button variant="outline"><Heart className="mr-2 h-4 w-4" /> Like ({problem.stats.likes})</Button>
          <Button variant="outline"><Bookmark className="mr-2 h-4 w-4" /> Save ({problem.stats.saves})</Button>
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
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Code Section */}
          <Card className="bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Code2 /> Code Solutions</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeViewer code={problem.code} />
            </CardContent>
          </Card>

          {/* Flowchart Section */}
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

        {/* Side Panel */}
        <div className="space-y-8">
          {/* Comments Section */}
          <Card className="bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageCircle /> Comments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {problem.comments.length > 0 ? (
                problem.comments.map(comment => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{comment.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p className="font-semibold">{comment.author}</p>
                      <p className="text-muted-foreground">{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Be the first to comment! 🤔</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
