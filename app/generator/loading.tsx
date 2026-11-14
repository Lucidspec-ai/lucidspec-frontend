// app/generator/loading.tsx
import Spinner from '@/components/Spinner';

export default function LoadingGenerator() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-3 text-gray-600">
        <Spinner className="h-6 w-6" label="Opening generator" />
        <span>Opening generator…</span>
      </div>
      <div className="mt-6 space-y-3 animate-pulse">
        <div className="h-5 w-1/3 bg-gray-200 rounded" />
        <div className="h-32 w-full bg-gray-200 rounded" />
        <div className="h-9 w-32 bg-gray-200 rounded" />
      </div>
      <p className="text-xs text-gray-400 mt-6">
        Heads up: generating a ticket can take around 15–25 seconds.
      </p>
    </main>
  );
}