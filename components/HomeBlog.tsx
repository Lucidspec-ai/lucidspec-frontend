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

export default function HomeBlog() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id,slug,title,excerpt,cover_url,published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) {
        setError('Failed to load blog posts');
        setLoading(false);
        return;
      }

      setPosts((data as Post[]) || []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-14">
        <p className="text-gray-500">Loading...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-14">
        <p className="text-red-500">{error}</p>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-14">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">From the Blog</h2>
        <Link href="/blog" className="text-sm text-blue-600 hover:underline">
          View all
        </Link>
      </div>

      {posts && posts.length ? (
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
                  alt=""
                  className="w-full h-44 object-cover"
                />
              ) : (
                <div className="w-full h-44 bg-gray-100" />
              )}
              <div className="p-4">
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                  {p.published_at
                    ? new Date(p.published_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : ''}
                </div>
                <h3 className="font-semibold group-hover:underline">
                  {p.title}
                </h3>
                {p.excerpt && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                    {p.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No posts yet.</p>
      )}
    </section>
  );
}