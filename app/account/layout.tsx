import React from 'react';
import { SettingsLayout } from '@/components/settings/SettingsLayout';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <SettingsLayout>{children}</SettingsLayout>;
}
