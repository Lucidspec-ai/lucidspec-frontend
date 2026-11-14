'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { safeGetSession } from '@/lib/safeSession';

type Props = {
  className?: string;
};

export default function AdminLink({ className = 'text-sm hover:underline' }: Props) {
  // loading avoids a flash of the link for non-admins
  const [status, setStatus] = useState<'loading' | 'show' | 'hide'>('loading');

  const compute = async () => {
    const { data } = await safeGetSession();
    const uid = data.session?.user?.id;
    if (!uid) {
      setStatus('hide');
      return;
    }

    const { data: prof } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', uid)
      .single();

    const isAdmin = (prof?.role ?? 'user') === 'admin';
    setStatus(isAdmin ? 'show' : 'hide');
  };

  useEffect(() => {
    // run once on mount
    compute();
    // and again whenever auth state changes (sign in/out, token refresh)
    const { data: sub } = supabase.auth.onAuthStateChange(() => compute());
    return () => sub.subscription.unsubscribe();
  }, []);

  if (status !== 'show') return null;

  const isBlock = className.includes('block') || className.includes('w-full');
  const containerClass = isBlock ? 'flex flex-col gap-2' : 'flex items-center gap-3';

  return (
    <div className={containerClass}>
      <Link href="/admin/blog" className={className}>Admin</Link>
      <Link href="/admin/feedback" className={className}>Feedback</Link>
      <Link href="/admin/slack-overrides" className={className}>Overrides</Link>
    </div>
  );
}
