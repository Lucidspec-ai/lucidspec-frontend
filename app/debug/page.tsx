'use client';

export default function Debug() {
  console.log('SUPABASE_URL =', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('API_BASE_URL =', process.env.NEXT_PUBLIC_API_BASE_URL);
  console.log('API_BASE     =', process.env.NEXT_PUBLIC_API_BASE);
  console.log('API_URL      =', process.env.NEXT_PUBLIC_API_URL);
  return (
    <div style={{padding: 16}}>
      Open DevTools → Console. You should see the two lines above.
    </div>
  );
}
