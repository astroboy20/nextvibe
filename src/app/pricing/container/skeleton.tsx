"use client"

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";


const PricingSkeleton =()=> {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex flex-col items-center mb-12">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-5 w-96 mb-2" />
        <Skeleton className="h-5 w-80" />
      </div>
      <div className="flex justify-center mb-8">
        <Skeleton className="h-10 w-52 rounded-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="p-6 rounded-2xl border border-gray-200">
              <Skeleton className="h-10 w-10 rounded-full mb-4" />
              <Skeleton className="h-5 w-24 mb-6" />
              <Skeleton className="h-12 w-36 mb-2" />
              <Skeleton className="h-4 w-20 mb-6" />
              <Skeleton className="h-10 w-full rounded-lg mb-8" />
              <Skeleton className="h-px w-full mb-6" />
              <Skeleton className="h-4 w-20 mb-4" />
              <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-44" />
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}

export default PricingSkeleton