import { getProblemById } from "@/lib/data";
import { notFound } from "next/navigation";
import { ProblemView } from "@/components/ProblemView";

type ProblemPageProps = {
  params: {
    id: string;
  };
};

export default async function ProblemPage({ params }: ProblemPageProps) {
  const problem = await getProblemById(params.id);

  if (!problem) {
    notFound();
  }

  return <ProblemView problem={problem} />;
}
