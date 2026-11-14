export const BLOG_STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_BLOG_BUCKET || process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'blog';

export function storagePointer(path: string) {
  return `storage://${BLOG_STORAGE_BUCKET}/${path}`;
}
