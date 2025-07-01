"use client";

import { useState } from "react";
import type { Comment } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageCircle } from "lucide-react";
import { Separator } from "./ui/separator";

interface CommentsSectionProps {
  initialComments: Comment[];
}

export function CommentsSection({ initialComments }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !text.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: author.trim(),
      avatar: author.trim().charAt(0).toUpperCase() || '🤔',
      text: text.trim(),
      timestamp: "Just now",
    };

    setComments([newComment, ...comments]);
    setAuthor("");
    setText("");
  };

  return (
    <Card className="bg-card/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle /> Comments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* New Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="author">Your Name</Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Enter your name"
              required
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
            />
          </div>
          <Button type="submit">Post Comment</Button>
        </form>

        <Separator />

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
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
