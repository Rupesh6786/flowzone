"use client";

import { useState, useMemo, useEffect } from "react";
import { ProblemCard } from "@/components/ProblemCard";
import { Input } from "@/components/ui/input";
import { getProblems } from "@/lib/data";
import { Search } from "lucide-react";
import type { Problem } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProblems = async () => {
      setIsLoading(true);
      try {
        const fetchedProblems = await getProblems();
        setProblems(fetchedProblems);
      } catch (error) {
        console.error("Failed to fetch problems:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const filteredProblems = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase().trim();
    if (!lowercasedQuery) {
      return problems;
    }
    return problems.filter((problem) => {
      const searchableText = [
        problem.title,
        problem.description,
        ...problem.tags,
      ].join(' ').toLowerCase();
      return searchableText.includes(lowercasedQuery);
    });
  }, [searchQuery, problems]);

  return (
    <div className="flex flex-col items-center space-y-8 md:space-y-12">
      <div className="text-center space-y-2 md:space-y-4 pt-8 md:pt-16">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold font-headline tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60">
          FlowZone 🚀
        </h1>
        <p className="text-base md:text-xl text-muted-foreground max-w-2xl">
          Visualize Code. Master Logic. The Gen-Z way to understand algorithms.
        </p>
      </div>

      <div className="w-full max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search problems by title, tag, or keyword (e.g. 'palindrome')"
            className="pl-10 h-12 text-base rounded-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-lg" />)
        ) : filteredProblems.length > 0 ? (
          filteredProblems.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} />
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <p className="text-muted-foreground">
              {searchQuery ? `No problems found for "${searchQuery}"` : "No problems have been created yet. Be the first! 🚀"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
