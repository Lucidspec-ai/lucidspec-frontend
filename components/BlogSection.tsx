// components/BlogSection.tsx
import Link from 'next/link';
import { posts } from '@/app/blog/data';

export default function BlogSection() {
  // show the latest 3 posts
  const latest = posts.slice(0, 3);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-semibold">From the Blog</h2>
          <Link href="/blog" className="text-sm text-blue-600 hover:underline">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latest.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="block rounded-lg border overflow-hidden hover:shadow transition"
              prefetch
            >
              {p.cover ? (
                <img
                  src={p.cover}
                  alt={p.title}
                  className="w-full h-40 object-cover"
                />
              ) : null}

              <div className="p-4">
                <div className="text-xs text-gray-500 mb-1">
                  {new Date(p.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>

                <h3 className="font-medium hover:underline">{p.title}</h3>

                {p.excerpt ? (
                  <p className="mt-2 text-sm text-gray-600">{p.excerpt}</p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}