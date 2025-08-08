import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-dark-700/60 rounded ${className ?? ''}`} />
);

export const SkeletonCard: React.FC = () => (
  <div className="glass-dark rounded-xl p-5 border border-dark-700">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-40" />
      </div>
      <Skeleton className="h-10 w-10 rounded-lg" />
    </div>
    <div className="mt-4 space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  </div>
);
