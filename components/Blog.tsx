// components/blog.tsx
'use client';

import HomeBlog from '@/components/HomeBlog';

/**
 * Home "From the Blog" section.
 * Delegates to the dynamic Supabase-powered component used by /blog.
 */
export default function Blog() {
  return <HomeBlog />;
}