import Spinner from '@/components/Spinner';

export default function Loading() {
  return (
    <main className="min-h-[50vh] flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-600">
        <Spinner className="h-6 w-6" label="Loading" />
        <span>Loading…</span>
      </div>
    </main>
  );
}