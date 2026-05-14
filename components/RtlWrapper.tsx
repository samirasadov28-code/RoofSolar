'use client';

import { useLang } from '@/lib/i18n/context';

export function RtlWrapper({ children }: { children: React.ReactNode }) {
  const { isRtl } = useLang();
  return <div dir={isRtl ? 'rtl' : 'ltr'}>{children}</div>;
}
