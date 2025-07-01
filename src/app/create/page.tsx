import { ProblemForm } from "@/components/ProblemForm";

export default function CreateProblemPage() {
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
