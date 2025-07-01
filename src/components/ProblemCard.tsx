import Link from "next/link";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Problem } from "@/lib/types";
import { ArrowRight } from "lucide-react";

interface ProblemCardProps {
  problem: Problem;
}

export function ProblemCard({ problem }: ProblemCardProps) {
  return (
    <Link href={`/problem/${problem.id}`} className="group">
      <Card className="h-full bg-card/60 backdrop-blur-sm transition-all duration-300 hover:border-primary/60 hover:shadow-lg hover:-translate-y-1 flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline text-xl">{problem.title}</CardTitle>
          <CardDescription className="line-clamp-2">{problem.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="flex flex-wrap gap-2">
            {problem.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex items-center text-sm text-primary group-hover:underline">
            View Details <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
