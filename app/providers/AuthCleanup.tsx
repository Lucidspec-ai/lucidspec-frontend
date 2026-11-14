'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function AuthCleanup() {
  useEffect(() => {
    const onBeforeUnload = () => {
      // Best-effort sign-out; sessionStorage also clears on browser close
      supabase.auth.signOut().catch(() => {});
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);
  return null;
}

