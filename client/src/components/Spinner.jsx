import React from "react";

export default function Spinner({ size = "md", className = "" }) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-[3px]"
  };
  return (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-maroon-200 border-t-maroon-600 ${className}`}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="grid min-h-[300px] place-items-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500 font-medium">Loading...</p>
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-lg border border-rose-100 bg-white shadow-soft animate-pulse">
          <div className="aspect-[4/3] bg-rose-50" />
          <div className="p-5 grid gap-3">
            <div className="h-5 w-2/3 rounded bg-rose-50" />
            <div className="h-4 w-1/2 rounded bg-rose-50" />
            <div className="h-4 w-3/4 rounded bg-rose-50" />
            <div className="mt-2 flex gap-2">
              <div className="h-9 flex-1 rounded bg-rose-50" />
              <div className="h-9 flex-1 rounded bg-maroon-50" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
