import { ProblemCard } from "@/components/ProblemCard";
import { Input } from "@/components/ui/input";
import { getProblems } from "@/lib/data";
import { Search } from "lucide-react";

export default function Home() {
  const problems = getProblems();

  return (
    <div className="flex flex-col items-center space-y-12">
      <div className="text-center space-y-4 pt-16">
        <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60">
          FlowZone 🚀
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
          Visualize Code. Master Logic. The Gen-Z way to understand algorithms.
        </p>
      </div>

      <div className="w-full max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search problems by title, tag, or keyword (e.g. 'average of 3 numbers')"
            className="pl-10 h-12 text-base rounded-full"
          />
        </div>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {problems.map((problem) => (
          <ProblemCard key={problem.id} problem={problem} />
        ))}
      </div>
    </div>
  );
}
