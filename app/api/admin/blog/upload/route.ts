import { Buffer } from 'node:buffer';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { BLOG_STORAGE_BUCKET, storagePointer } from '@/lib/blogStorage';

export const runtime = 'nodejs';

async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();

  const { data: auth, error: authError } = await supabase.auth.getUser(token);
  if (authError || !auth?.user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const userId = auth.user.id;
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (profileError) {
    return NextResponse.json({ error: 'Unable to verify user role' }, { status: 403 });
  }

  if ((profile?.role ?? 'user') !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return { supabase, userId } as const;
}

function formatStorageError(action: string, message: string) {
  if (/bucket/i.test(message) && /not.+found/i.test(message)) {
    return `${action} failed: Bucket "${BLOG_STORAGE_BUCKET}" not found. Create it in Supabase Storage or set NEXT_PUBLIC_SUPABASE_BLOG_BUCKET.`;
  }
  if (/row-level security/i.test(message)) {
    return `${action} failed: Storage policies rejected the request. Ensure the bucket allows service role access.`;
  }
  return `${action} failed: ${message}`;
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { supabase } = authResult;
    const form = await req.formData();
    const type = form.get('type');
    const path = form.get('path');

    if (typeof type !== 'string' || typeof path !== 'string' || !path.trim()) {
      return NextResponse.json({ error: 'Invalid upload payload' }, { status: 400 });
    }

    if (!BLOG_STORAGE_BUCKET) {
      return NextResponse.json({ error: 'Storage bucket not configured' }, { status: 500 });
    }

    if (type === 'cover') {
      const file = form.get('file');
      if (!(file instanceof File)) {
        return NextResponse.json({ error: 'Missing file' }, { status: 400 });
      }
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = (form.get('contentType') as string) || file.type || 'application/octet-stream';

      const { error } = await supabase.storage.from(BLOG_STORAGE_BUCKET).upload(path, buffer, {
        upsert: true,
        cacheControl: '3600',
        contentType,
      });

      if (error) {
        return NextResponse.json({ error: formatStorageError('Cover upload', error.message) }, { status: 400 });
      }

      const { data: publicData } = supabase.storage.from(BLOG_STORAGE_BUCKET).getPublicUrl(path);
      return NextResponse.json({ ok: true, path, pointer: storagePointer(path), publicUrl: publicData?.publicUrl || null });
    }

    if (type === 'content') {
      const content = form.get('content');
      if (typeof content !== 'string') {
        return NextResponse.json({ error: 'Missing content' }, { status: 400 });
      }

      const buffer = Buffer.from(content, 'utf-8');
      const { error } = await supabase.storage.from(BLOG_STORAGE_BUCKET).upload(path, buffer, {
        upsert: true,
        cacheControl: '3600',
        contentType: (form.get('contentType') as string) || 'text/markdown; charset=utf-8',
      });

      if (error) {
        return NextResponse.json({ error: formatStorageError('Content upload', error.message) }, { status: 400 });
      }

      const { data: publicData } = supabase.storage.from(BLOG_STORAGE_BUCKET).getPublicUrl(path);
      return NextResponse.json({ ok: true, path, pointer: storagePointer(path), publicUrl: publicData?.publicUrl || null });
    }

    return NextResponse.json({ error: 'Unsupported upload type' }, { status: 400 });
  } catch (error: any) {
    const message = typeof error?.message === 'string' ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
