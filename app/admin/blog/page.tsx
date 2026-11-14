// app/admin/blog/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { safeGetSession } from '@/lib/safeSession';

type AdminPost = {
  id: string;
  slug: string;
  title: string;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
};

export default function AdminBlogListPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, slug, title, status, published_at, created_at')
      .order('created_at', { ascending: false });

    if (!error) setPosts((data as AdminPost[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      // 1) must be signed in
      const { data: sess } = await safeGetSession();
      const userId = sess.session?.user?.id;
      if (!userId) {
        router.replace('/signin?next=/admin/blog');
        return;
      }

      // 2) must be admin
      const { data: prof } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      const ok = (prof?.role ?? 'user') === 'admin';
      if (!alive) return;
      setIsAdmin(ok);

      if (!ok) {
        router.replace('/'); // non-admins back to home
        return;
      }

      // 3) load posts
      await load();
    })();

    return () => {
      alive = false;
    };
  }, [router, load]);

  const toggleStatus = async (p: AdminPost) => {
    const next = p.status === 'published' ? 'draft' : 'published';
    const updates: any = { status: next };
    updates.published_at = next === 'published' ? new Date().toISOString() : null;

    const { error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', p.id);

    if (error) {
      alert(error.message);
      return;
    }
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) {
      alert(error.message);
      return;
    }
    await load();
  };

  if (isAdmin === null) {
    return <main className="max-w-5xl mx-auto p-6">Checking access…</main>;
  }
  if (isAdmin === false) {
    return <main className="max-w-5xl mx-auto p-6" />;
  }

  return (
    <main className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Blog — Admin</h1>
        <Link
          href="/admin/blog/new"
          className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          New post
        </Link>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : posts.length === 0 ? (
        <div className="text-gray-600">No posts yet.</div>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Status</th>
                <th className="p-3">Published</th>
                <th className="p-3 w-56">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{p.title || <span className="text-gray-400">Untitled</span>}</td>
                  <td className="p-3">{p.slug || <span className="text-gray-400">—</span>}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        p.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {p.published_at
                      ? new Date(p.published_at).toLocaleString()
                      : '—'}
                  </td>
                  <td className="p-3 flex gap-2">
                    <Link
                      href={`/admin/blog/new?id=${p.id}`}
                      className="px-2 py-1 rounded border hover:bg-gray-50"
                    >
                      Edit
                    </Link>
                    {p.status === 'published' && p.slug ? (
                      <Link
                        href={`/blog/${p.slug}`}
                        target="_blank"
                        className="px-2 py-1 rounded border hover:bg-gray-50"
                      >
                        Preview
                      </Link>
                    ) : null}
                    <button
                      onClick={() => toggleStatus(p)}
                      className="px-2 py-1 rounded border hover:bg-gray-50"
                    >
                      {p.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => remove(p.id)}
                      className="px-2 py-1 rounded border text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
