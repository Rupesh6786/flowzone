import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      <div className="text-center space-y-4 mb-12">
        <Skeleton className="h-12 w-1/2 mx-auto" />
        <Skeleton className="h-6 w-3/4 mx-auto" />
      </div>
      
      <div className="space-y-8">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
        <div className="flex justify-end">
            <Skeleton className="h-12 w-32" />
        </div>
      </div>
    </div>
  );
}
