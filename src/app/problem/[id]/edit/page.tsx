
'use client';

import { useEffect, useState } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getProblemById } from '@/lib/data';
import type { Problem } from '@/lib/types';
import { ProblemForm } from '@/components/ProblemForm';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type EditProblemPageProps = {
  params: { id: string };
};

function EditProblemPageContent({ problem }: { problem: Problem }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="text-center">
           <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
           <p className="mt-4 text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
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

export default function EditProblemPage({ params }: EditProblemPageProps) {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const fetchedProblem = await getProblemById(params.id);
        if (fetchedProblem) {
          setProblem(fetchedProblem);
        } else {
          setError(true);
        }
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [params.id]);

  if (error) {
    notFound();
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2 mb-12">
            <Skeleton className="h-10 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
        </div>
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return <EditProblemPageContent problem={problem!} />;
}
