// components/GetStartedButton.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { safeGetSession } from '@/lib/safeSession';
import { readCachedSession } from '@/lib/sessionCache';
import { supabase } from '@/lib/supabase';

type Props = {
  className?: string;
  loggedOutLabel?: string;
  loggedInLabel?: string;
  loggedOutHref?: string;
  loggedInHref?: string;
};

export default function GetStartedButton({
  className,
  loggedOutLabel = 'Start Free',
  loggedInLabel = 'Open workspace',
  loggedOutHref = '/signin?next=/generator',
  loggedInHref = '/generator',
}: Props) {
  const cachedSession = readCachedSession();
  const [href, setHref] = useState(cachedSession?.access_token ? loggedInHref : loggedOutHref);
  const [label, setLabel] = useState(cachedSession?.access_token ? loggedInLabel : loggedOutLabel);

  useEffect(() => {
    let mounted = true;

    const syncFromSession = (session: { access_token?: string } | null | undefined) => {
      if (!mounted) return;
      if (session?.access_token) {
        setHref(loggedInHref);
        setLabel(loggedInLabel);
      } else {
        setHref(loggedOutHref);
        setLabel(loggedOutLabel);
      }
    };

    safeGetSession().then(({ data }) => {
      syncFromSession(data.session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      syncFromSession(session);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [loggedInHref, loggedInLabel, loggedOutHref, loggedOutLabel]);

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}
