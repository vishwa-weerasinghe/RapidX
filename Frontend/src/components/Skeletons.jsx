import React from "react";

/**
 * TopLoadingBar
 * A sleek, high-end YouTube/GitHub style progress bar fixed at the very top of the viewport.
 */
export function TopLoadingBar({ progress = 0, visible = true }) {
  if (!visible && progress >= 100) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed top-0 left-0 right-0 z-[99999] pointer-events-none transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-[3px] bg-gradient-to-r from-castleton via-emerald-400 to-sacramento shadow-[0_0_10px_rgba(4,57,39,0.5)] transition-all duration-300 ease-out"
        style={{
          width: `${Math.min(100, Math.max(0, progress))}%`,
        }}
      />
    </div>
  );
}

/**
 * PackageCardSkeleton
 * Shimmer skeleton matching the exact structure and dimensions of home page package cards.
 */
export function PackageCardSkeleton() {
  return (
    <div className="w-full bg-white dark:bg-[#1D2B22] rounded-3xl overflow-hidden border border-gray-200 dark:border-[#2F4437] shadow-sm flex flex-col transition-colors">
      {/* Image Skeleton */}
      <div className="relative h-64 sm:h-72 skeleton-shimmer overflow-hidden">
        {/* Subtle inner shine */}
        <div className="absolute inset-0 bg-black/5 dark:bg-white/5" />
      </div>

      {/* Content Skeleton */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Title */}
        <div className="h-5 w-3/4 skeleton-shimmer rounded-md mb-3" />

        {/* Description Lines */}
        <div className="space-y-2 mb-5">
          <div className="h-3.5 w-full skeleton-shimmer rounded" />
          <div className="h-3.5 w-5/6 skeleton-shimmer rounded" />
          <div className="h-3.5 w-2/3 skeleton-shimmer rounded" />
        </div>

        {/* Feature Checkmarks */}
        <div className="space-y-2.5 mb-5 mt-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full skeleton-shimmer shrink-0" />
            <div className="h-3 w-32 skeleton-shimmer rounded" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full skeleton-shimmer shrink-0" />
            <div className="h-3 w-28 skeleton-shimmer rounded" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full skeleton-shimmer shrink-0" />
            <div className="h-3 w-24 skeleton-shimmer rounded" />
          </div>
        </div>

        {/* Price Row */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-[#2F4437] pt-4 mb-4">
          <div className="space-y-1.5">
            <div className="h-2.5 w-16 skeleton-shimmer rounded" />
            <div className="h-3 w-20 skeleton-shimmer rounded" />
          </div>
          <div className="h-6 w-16 skeleton-shimmer rounded-lg" />
        </div>

        {/* Action Button */}
        <div className="h-11 w-full skeleton-shimmer rounded-full mt-1" />
      </div>
    </div>
  );
}

/**
 * ReviewCardSkeleton
 * Shimmer skeleton matching TripAdvisor and Guest review cards.
 */
export function ReviewCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl shadow-sm border bg-white dark:bg-[#1D2B22] border-gray-100 dark:border-[#2F4437] flex flex-col justify-between transition-colors">
      <div>
        {/* Header Row: Avatar + Name + Source Badge */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-full skeleton-shimmer shrink-0" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-28 skeleton-shimmer rounded" />
              <div className="h-2.5 w-16 skeleton-shimmer rounded" />
            </div>
          </div>
          <div className="h-6 w-20 skeleton-shimmer rounded-full" />
        </div>

        {/* Star Ratings Placeholder */}
        <div className="flex items-center gap-1.5 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-3.5 h-3.5 skeleton-shimmer rounded-sm" />
          ))}
        </div>

        {/* Review Title */}
        <div className="h-4 w-3/5 skeleton-shimmer rounded mb-2.5" />

        {/* Review Description */}
        <div className="space-y-2">
          <div className="h-3 w-full skeleton-shimmer rounded" />
          <div className="h-3 w-11/12 skeleton-shimmer rounded" />
          <div className="h-3 w-4/5 skeleton-shimmer rounded" />
        </div>
      </div>
    </div>
  );
}
