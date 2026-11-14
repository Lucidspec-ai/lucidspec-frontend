import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import type { SupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

type Post = {
  title: string;
  content_md: string;
  cover_url: string | null;
  published_at: string | null;
  excerpt?: string | null;
};

const STORAGE_PREFIX = 'storage://';

function isStoragePointer(value: string | null | undefined) {
  return typeof value === 'string' && value.startsWith(STORAGE_PREFIX);
}

async function resolveStoredContent(client: SupabaseClient, value: string) {
  const pointer = value.slice(STORAGE_PREFIX.length);
  const firstSlash = pointer.indexOf('/');
  if (firstSlash < 0) throw new Error('Invalid stored content pointer.');

  const bucket = pointer.slice(0, firstSlash);
  const path = pointer.slice(firstSlash + 1);

  const { data } = client.storage.from(bucket).getPublicUrl(path);
  const url = data?.publicUrl;
  if (!url) throw new Error('Failed to resolve stored content URL.');

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to download stored content.');
  return res.text();
}

async function loadPost(slug: string) {
  const { client, error } = createServerSupabaseClient();
  if (!client || error) {
    return { post: null, error: error ?? 'Supabase client unavailable.' };
  }

  const { data, error: queryError } = await client
    .from('blog_posts')
    .select('title,content_md,cover_url,published_at,excerpt')
    .eq('slug', slug)
    .eq('status', 'published')
    .single<Post>();

  if (queryError || !data) return { post: null, error: queryError?.message ?? null };

  let content = data.content_md || '';
  let loadError: string | null = null;

  if (isStoragePointer(content)) {
    try {
      content = await resolveStoredContent(client, content);
    } catch (err: any) {
      loadError = err?.message || 'Failed to load full post.';
      content = '';
    }
  }

  return { post: { ...data, content_md: content }, error: loadError };
}

type PageProps = { params: Promise<{ slug: string }> };

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  if (!slug) return notFound();

  const { post, error } = await loadPost(slug);
  if (!post) {
    if (error) {
      return (
        <main className="max-w-3xl mx-auto p-6">
          <Link href="/blog" className="text-sm text-gray-600 hover:underline inline-flex items-center gap-1">
            ← Back to blog
          </Link>
          <div className="mt-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            Error loading post: {error}
          </div>
        </main>
      );
    }
    return notFound();
  }

  const date =
    post.published_at &&
    new Date(post.published_at).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <main className="max-w-3xl mx-auto p-6">
      <Link href="/blog" className="text-sm text-gray-600 hover:underline inline-flex items-center gap-1">
        ← Back to blog
      </Link>

      <article className="mt-4">
        {post.cover_url && (
          <img src={post.cover_url} alt="" className="w-full h-64 object-cover rounded mb-6" />
        )}
        <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
        {date && <div className="text-sm text-gray-500 mb-6">{date}</div>}

        {error ? (
          <div className="text-sm text-red-600 mb-4">{error}</div>
        ) : (
          <div className="prose max-w-none">
            <ReactMarkdown>{post.content_md}</ReactMarkdown>
          </div>
        )}
      </article>
    </main>
  );
}
