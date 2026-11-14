import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_url: string | null;
  published_at: string | null;
  status?: string;
};

async function loadPublishedPosts() {
  const { client, error } = createServerSupabaseClient();
  if (!client || error) {
    return { posts: [], error: error ?? 'Supabase client unavailable.' };
  }

  const { data, error: queryError } = await client
    .from('blog_posts')
    .select('id,slug,title,excerpt,cover_url,published_at,status')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  return { posts: data ?? [], error: queryError?.message ?? null };
}

export default async function BlogIndex() {
  const { posts, error } = await loadPublishedPosts();

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[linear-gradient(180deg,#eef4ff_0%,#ffffff_75%)]">
        <div className="mx-auto max-w-5xl px-4 pb-8 pt-14 sm:px-6 md:pb-10 md:pt-16">
          <h1 className="text-4xl font-bold mb-2">Blog</h1>
          <p className="text-slate-600">
            Product updates, guides, and best practices for LucidSpec.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 pb-10 pt-6 sm:px-6 md:pt-8">
          {error && (
            <div className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              Error loading posts: {error}
            </div>
          )}

          {!error && posts.length === 0 && (
            <div>No posts yet.</div>
          )}

          {!error && posts.length > 0 && (
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
                    <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                      {p.published_at
                        ? new Date(p.published_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </div>
                    <h2 className="font-semibold group-hover:underline">
                      {p.title}
                    </h2>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-3">
                      {p.excerpt ?? ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
