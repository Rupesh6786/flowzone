import { getProblemById } from "@/lib/data";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { CodeViewer } from "@/components/CodeViewer";
import { FlowchartRenderer } from "@/components/FlowchartRenderer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Bookmark, MessageCircle, Share2, Code2 } from "lucide-react";

type ProblemPageProps = {
  params: {
    id: string;
  };
};

export default function ProblemPage({ params }: ProblemPageProps) {
  const problem = getProblemById(params.id);

  if (!problem) {
    notFound();
  }

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
          <Button variant="outline"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
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
