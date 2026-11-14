'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { safeGetSession } from '@/lib/safeSession';
import { storagePointer } from '@/lib/blogStorage';

type RoleRow = { role?: string | null };
type PostRow = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_url: string | null;
  content_md: string;
  status: 'draft' | 'published';
  published_at: string | null;
};

const CONTENT_STORAGE_THRESHOLD = 12000;

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function NewBlogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingId = searchParams?.get('id') || null;

  // auth / gate
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // form
  const [title, setTitle] = useState('');
  const autoSlug = useMemo(() => slugify(title), [title]);
  const [slug, setSlug] = useState(''); // user can override
  const finalSlug = (slug || autoSlug).slice(0, 120);

  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [existingPublishedAt, setExistingPublishedAt] = useState<string | null>(null);

  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverURL, setCoverURL] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>('');
  const [loadingExisting, setLoadingExisting] = useState(false);

  // -------------- auth + role check --------------
  useEffect(() => {
    (async () => {
      try {
        const { data: sess } = await safeGetSession();
        const uid = sess.session?.user?.id;
        if (!uid) {
          router.replace('/signin?next=/admin/blog/new');
          return;
        }
        const { data: prof, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', uid)
          .single<RoleRow>();

        if (error) throw error;
        const ok = (prof?.role ?? 'user') === 'admin';
        setIsAdmin(ok);
        if (!ok) router.replace('/'); // non-admins out
      } catch {
        router.replace('/');
      } finally {
        setChecking(false);
      }
    })();
  }, [router]);

  // -------------- cover upload --------------
  async function getAccessToken() {
    const { data: sess } = await safeGetSession();
    const token = sess.session?.access_token;
    if (!token) {
      throw new Error('Please sign in again to upload assets.');
    }
    return token;
  }

  async function postToStorage(formData: FormData) {
    const token = await getAccessToken();
    const res = await fetch('/api/admin/blog/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const payload = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(payload?.error || 'Storage upload failed.');
    }
    return payload as { ok: boolean; path: string; pointer: string; publicUrl: string | null };
  }

  function resetForm() {
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setStatus('draft');
    setExistingPublishedAt(null);
    setCoverFile(null);
    setCoverURL(null);
    setMsg('');
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  }

  const STORAGE_PREFIX = 'storage://';

  function isStoragePointer(value: string | null | undefined) {
    return typeof value === 'string' && value.startsWith(STORAGE_PREFIX);
  }

  async function resolveStoredContent(value: string) {
    const pointer = value.slice(STORAGE_PREFIX.length);
    const firstSlash = pointer.indexOf('/');
    if (firstSlash < 0) {
      throw new Error('Invalid stored content pointer.');
    }

    const bucket = pointer.slice(0, firstSlash);
    const path = pointer.slice(firstSlash + 1);

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    const url = data?.publicUrl;
    if (!url) {
      throw new Error('Failed to resolve stored content URL.');
    }

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Failed to download stored content.');
    }

    return res.text();
  }

  useEffect(() => {
    if (editingId) return;
    resetForm();
  }, [editingId]);

  useEffect(() => {
    if (!editingId) return;
    let active = true;
    setLoadingExisting(true);

    (async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('title, slug, excerpt, content_md, status, cover_url, published_at')
          .eq('id', editingId)
          .single<PostRow>();

        if (!active) return;

        if (error || !data) {
          setMsg(error?.message || 'Unable to load post for editing.');
          return;
        }

        let contentValue = data.content_md || '';
        if (isStoragePointer(contentValue)) {
          try {
            contentValue = await resolveStoredContent(contentValue);
          } catch (err: any) {
            console.error('Failed to load stored content', err);
            setMsg(formatError(err));
            contentValue = '';
          }
        }

        setTitle(data.title || '');
        setSlug(data.slug || '');
        setExcerpt(data.excerpt || '');
        setContent(contentValue);
        setStatus(data.status || 'draft');
        setExistingPublishedAt(data.published_at || null);
        setCoverFile(null);
        setCoverURL(data.cover_url || null);
        if (coverInputRef.current) {
          coverInputRef.current.value = '';
        }
        setMsg('');
      } finally {
        if (active) setLoadingExisting(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [editingId]);

  async function uploadCover() {
    if (!coverFile) return null;

    const ext = coverFile.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `covers/${finalSlug}-${Date.now()}.${ext}`;

    const form = new FormData();
    form.append('type', 'cover');
    form.append('path', path);
    form.append('contentType', coverFile.type || 'application/octet-stream');
    form.append('file', coverFile);

    const payload = await postToStorage(form);
    return payload.publicUrl;
  }

  // -------------- save post --------------
  async function persistContentBody(raw: string) {
    if (raw.length <= CONTENT_STORAGE_THRESHOLD) {
      return { storedValue: raw, viaStorage: false };
    }

    const baseSlug = finalSlug || slugify(title || 'post');

    const path = `content/${baseSlug}-${Date.now()}.md`;

    const form = new FormData();
    form.append('type', 'content');
    form.append('path', path);
    form.append('content', raw);
    form.append('contentType', 'text/markdown; charset=utf-8');

    await postToStorage(form);

    return { storedValue: storagePointer(path), viaStorage: true };
  }

  function formatError(err: unknown) {
    if (!err) return 'Save failed';
    if (typeof err === 'string') return err;
    if (err instanceof Error) {
      const details = (err as any)?.details || (err as any)?.hint;
      return details ? `${err.message} (${details})` : err.message;
    }
    const message = (err as any)?.message || (err as any)?.error_description || (err as any)?.error;
    if (message) {
      const extra = (err as any)?.details || (err as any)?.hint;
      return extra ? `${message} (${extra})` : message;
    }
    try {
      return JSON.stringify(err);
    } catch {}
    return 'Save failed';
  }

  async function onSave() {
    setMsg('');
    if (!title || !finalSlug || !content) {
      setMsg('Please fill Title and Content (slug auto-fills).');
      return;
    }

    setSaving(true);
    try {
      console.log('blog: starting save', { finalSlug, status, hasCover: !!coverFile });
      let cover = coverURL;
      if (coverFile) {
        console.log('blog: uploading cover…');
        cover = await uploadCover();
        console.log('blog: cover uploaded', { cover });
        setCoverURL(cover);
      }

      console.log('blog: persisting content…');
      const { storedValue, viaStorage } = await persistContentBody(content);
      console.log('blog: content persisted', { viaStorage });

      const publishedAtValue =
        status === 'published'
          ? existingPublishedAt || new Date().toISOString()
          : null;

      const payload: PostRow = {
        title,
        slug: finalSlug,
        excerpt: excerpt || null,
        cover_url: cover || null,
        content_md: storedValue,
        status,
        published_at: publishedAtValue,
      };

      // Upsert by slug so you can re-save edits
      console.log('blog: upserting row…', payload.slug);
      let error = null;
      if (editingId) {
        ({ error } = await supabase.from('blog_posts').update(payload).eq('id', editingId));
      } else {
        ({ error } = await supabase.from('blog_posts').upsert(payload, { onConflict: 'slug' }));
      }
      console.log('blog: upsert finished', { error });

      if (error) throw error;

      setMsg(viaStorage ? 'Saved! (Large content stored securely.)' : 'Saved!');
      setExistingPublishedAt(publishedAtValue);
      if (status === 'published') {
        router.push(`/blog/${finalSlug}`);
      }
    } catch (e) {
      console.error('Save blog post failed', e);
      setMsg(formatError(e));
    } finally {
      console.log('blog: save cycle finished');
      setSaving(false);
    }
  }

  type FormatType =
    | 'bold'
    | 'italic'
    | 'underline'
    | 'strikethrough'
    | 'heading'
    | 'unorderedList'
    | 'orderedList'
    | 'quote'
    | 'code'
    | 'link';

  function applyFormatting(format: FormatType) {
    const textarea = contentRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    if (selectionStart === null || selectionEnd === null) return;

    const before = value.slice(0, selectionStart);
    const selected = value.slice(selectionStart, selectionEnd);
    const after = value.slice(selectionEnd);
    const hasSelection = selectionStart !== selectionEnd;

    function setNewValue(newValue: string, focusStart: number, focusEnd: number) {
      setContent(newValue);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.selectionStart = focusStart;
        textarea.selectionEnd = focusEnd;
      });
    }

    const wrapSelection = (prefix: string, suffix: string, placeholder: string) => {
      const inner = hasSelection ? selected : placeholder;
      const formatted = `${prefix}${inner}${suffix}`;
      const newValue = `${before}${formatted}${after}`;
      const focusStart = before.length + prefix.length;
      const focusEnd = focusStart + inner.length;
      setNewValue(newValue, focusStart, focusEnd);
    };

    switch (format) {
      case 'bold':
        wrapSelection('**', '**', 'bold text');
        break;
      case 'italic':
        wrapSelection('*', '*', 'italic text');
        break;
      case 'underline':
        wrapSelection('<u>', '</u>', 'underlined text');
        break;
      case 'strikethrough':
        wrapSelection('~~', '~~', 'removed text');
        break;
      case 'heading': {
        const placeholder = hasSelection ? selected : 'Heading text';
        const formatted = `# ${placeholder}`;
        const newValue = `${before}${formatted}${after}`;
        const start = before.length + 2;
        const end = start + placeholder.length;
        setNewValue(newValue, start, end);
        break;
      }
      case 'unorderedList': {
        const text = hasSelection ? selected : 'List item';
        const lines = text.split('\n').map((line, idx) => {
          const cleaned = line.replace(/^\s*([-*+]\s+|\d+\.\s+)/, '');
          if (cleaned.trim().length > 0) {
            return `- ${cleaned}`;
          }
          return idx === 0 ? '- List item' : '- ';
        });
        const formatted = lines.join('\n');
        const newValue = `${before}${formatted}${after}`;
        const start = before.length;
        const end = start + formatted.length;
        setNewValue(newValue, start, end);
        break;
      }
      case 'orderedList': {
        const text = hasSelection ? selected : 'First item\nSecond item';
        const lines = text.split('\n').map((line, idx) => {
          const cleaned = line.replace(/^\s*([-*+]\s+|\d+\.\s+)/, '');
          const content = cleaned.trim().length > 0 ? cleaned : `Item ${idx + 1}`;
          return `${idx + 1}. ${content}`;
        });
        const formatted = lines.join('\n');
        const newValue = `${before}${formatted}${after}`;
        const start = before.length;
        const end = start + formatted.length;
        setNewValue(newValue, start, end);
        break;
      }
      case 'quote': {
        const text = hasSelection ? selected : 'Quote text';
        const lines = text.split('\n').map((line) => `> ${line}`);
        const formatted = lines.join('\n');
        const newValue = `${before}${formatted}${after}`;
        const start = before.length;
        const end = start + formatted.length;
        setNewValue(newValue, start, end);
        break;
      }
      case 'code': {
        const text = hasSelection ? selected : 'code';
        if (text.includes('\n')) {
          const formatted = '\n\n```\n' + text + '\n```\n';
          const newValue = before + formatted + after;
          const start = before.length + 6;
          const end = start + text.length;
          setNewValue(newValue, start, end);
        } else {
          wrapSelection('`', '`', 'code snippet');
        }
        break;
      }
      case 'link': {
        const text = hasSelection ? selected : 'link text';
        const placeholderUrl = 'https://example.com';
        const formatted = `[${text}](${placeholderUrl})`;
        const newValue = `${before}${formatted}${after}`;
        const urlStart = before.length + text.length + 3;
        const urlEnd = urlStart + placeholderUrl.length;
        setNewValue(newValue, urlStart, urlEnd);
        break;
      }
      default:
        break;
    }
  }

  if (checking) {
    return <main className="max-w-3xl mx-auto p-6">Checking access…</main>;
  }
  if (!isAdmin) {
    return <main className="max-w-3xl mx-auto p-6">Forbidden.</main>;
  }
  if (editingId && loadingExisting) {
    return <main className="max-w-3xl mx-auto p-6">Loading post…</main>;
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{editingId ? 'Edit Blog Post' : 'New Blog Post'}</h1>
      {editingId ? (
        <div className="rounded bg-blue-50 border border-blue-100 px-3 py-2 text-sm text-blue-700">
          Editing existing post. Adjust fields and click Update to save.
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="block text-sm font-medium">Title</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Announcing LucidSpec v1"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium">
            Slug (auto from title; you can override)
          </label>
          <input
            className="w-full border rounded px-3 py-2"
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            placeholder={autoSlug || 'my-post'}
          />
          <div className="text-xs text-gray-500 mt-1">Final: <code>/blog/{finalSlug || '…'}</code></div>
        </div>

        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Excerpt (optional)</label>
        <textarea
          className="w-full border rounded px-3 py-2"
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Short summary for the list page and meta description…"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Cover image (optional)</label>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onClick={(e) => {
            // Allow picking the same file twice in a row without stale state
            (e.target as HTMLInputElement).value = '';
          }}
          onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
        />
        {coverURL && (
          <img src={coverURL} alt="cover preview" className="mt-2 max-h-40 rounded" />
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Content (Markdown)</label>
        <div className="flex flex-wrap gap-2 rounded border bg-gray-50 px-3 py-2 text-sm">
          <button
            type="button"
            onClick={() => applyFormatting('bold')}
            className="rounded border bg-white px-2 py-1 hover:bg-gray-100"
            title="Bold"
          >
            Bold
          </button>
          <button
            type="button"
            onClick={() => applyFormatting('italic')}
            className="rounded border bg-white px-2 py-1 hover:bg-gray-100"
            title="Italic"
          >
            Italic
          </button>
          <button
            type="button"
            onClick={() => applyFormatting('underline')}
            className="rounded border bg-white px-2 py-1 hover:bg-gray-100"
            title="Underline"
          >
            Underline
          </button>
          <button
            type="button"
            onClick={() => applyFormatting('strikethrough')}
            className="rounded border bg-white px-2 py-1 hover:bg-gray-100"
            title="Strikethrough"
          >
            Strike
          </button>
          <button
            type="button"
            onClick={() => applyFormatting('heading')}
            className="rounded border bg-white px-2 py-1 hover:bg-gray-100"
            title="Heading"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => applyFormatting('unorderedList')}
            className="rounded border bg-white px-2 py-1 hover:bg-gray-100"
            title="Bulleted list"
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => applyFormatting('orderedList')}
            className="rounded border bg-white px-2 py-1 hover:bg-gray-100"
            title="Numbered list"
          >
            1. List
          </button>
          <button
            type="button"
            onClick={() => applyFormatting('quote')}
            className="rounded border bg-white px-2 py-1 hover:bg-gray-100"
            title="Quote"
          >
            Quote
          </button>
          <button
            type="button"
            onClick={() => applyFormatting('code')}
            className="rounded border bg-white px-2 py-1 hover:bg-gray-100"
            title="Code"
          >
            Code
          </button>
          <button
            type="button"
            onClick={() => applyFormatting('link')}
            className="rounded border bg-white px-2 py-1 hover:bg-gray-100"
            title="Insert link"
          >
            Link
          </button>
        </div>
        <textarea
          ref={contentRef}
          className="w-full border rounded px-3 py-2 font-mono"
          rows={16}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`# Headline

Write your post in **Markdown** here…

- bullet 1
- bullet 2
`}
        />
        <p className="text-xs text-gray-500">
          Use the toolbar for common formatting or keep writing in Markdown—it all renders the same.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? 'Saving…' : editingId ? 'Update' : 'Save'}
        </button>
        {msg && <span className="text-sm">{msg}</span>}
      </div>
    </main>
  );
}
