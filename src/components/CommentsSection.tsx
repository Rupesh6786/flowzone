"use client";

import { useState, useEffect } from "react";
import type { Comment } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, MessageCircle } from "lucide-react";
import { Separator } from "./ui/separator";
import { addCommentAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

interface CommentsSectionProps {
  problemId: string;
  initialComments: Comment[];
}

export function CommentsSection({ problemId, initialComments }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !text.trim()) return;
    setIsSubmitting(true);

    const newCommentData = {
      author: author.trim(),
      text: text.trim(),
      avatar: author.trim().charAt(0).toUpperCase() || '🤔',
    };

    const result = await addCommentAction(problemId, newCommentData);

    if (result.success) {
      // Optimistically update UI
      setComments(prev => [...prev, {
          ...newCommentData,
          id: Date.now().toString(),
          timestamp: "Just now",
      }]);
      setAuthor("");
      setText("");
      toast({
          title: "Comment Posted! ✅",
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    }
    setIsSubmitting(false);
  };

  return (
    <Card className="bg-card/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle /> Comments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="author">Your Name</Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Enter your name"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">Your Comment</Label>
            <Textarea
              id="comment"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your thoughts, ask a question, or post a solution..."
              required
              rows={3}
              disabled={isSubmitting}
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post Comment
          </Button>
        </form>

        <Separator />

        <div className="space-y-4">
          {comments.length > 0 ? (
            [...comments].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((comment) => (
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
            <p className="text-sm text-muted-foreground text-center py-4">
              Be the first to comment! 🤔
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
