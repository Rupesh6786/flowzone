
import { getProblemById } from "@/lib/data";
import { notFound } from "next/navigation";
import { ProblemForm } from "@/components/ProblemForm";

type EditProblemPageProps = {
  params: { id: string };
};

export default async function EditProblemPage({ params }: EditProblemPageProps) {
  const problem = await getProblemById(params.id);

  if (!problem) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center space-y-2 mb-12">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Edit Problem ✍️</h1>
        <p className="text-muted-foreground">Make changes to this coding challenge.</p>
      </div>
      <ProblemForm problem={problem} />
    </div>
  );
}
