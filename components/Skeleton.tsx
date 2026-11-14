// Simple Tailwind skeletons
export function SkeletonLine({ className = '' }) {
  return <div className={`h-4 rounded animate-pulse bg-gray-200 ${className}`} />;
}

export function SkeletonBlock({ className = '' }) {
  return <div className={`rounded animate-pulse bg-gray-200 ${className}`} />;
}