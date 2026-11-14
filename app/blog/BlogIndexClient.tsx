// app/blog/BlogIndexClient.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_url: string | null;
  published_at: string | null;
};

export default function BlogIndexClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, slug, title, excerpt, cover_url, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (!error) setPosts((data as Post[]) || []);
      setLoading(false);
    })();
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-2">Blog</h1>
      <p className="text-gray-600 mb-8">
        Product updates, guides, and best practices for LucidSpec.
      </p>

      {loading ? (
        <div className="text-gray-500">Loading…</div>
      ) : posts.length === 0 ? (
        <div className="text-gray-500">No posts yet.</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/blog/${p.slug}`}
              className="group border rounded-lg overflow-hidden hover:shadow-sm transition"
            >
              {p.cover_url ? (
                <img
                  src={p.cover_url}
                  alt={p.title}
                  className="w-full h-40 object-cover"
                />
              ) : null}

              <div className="p-4">
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                  {p.published_at
                    ? new Date(p.published_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : '—'}
                </div>
                <h2 className="font-semibold group-hover:underline">{p.title}</h2>
                {p.excerpt ? (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                    {p.excerpt}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}