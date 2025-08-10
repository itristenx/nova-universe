import { SecurityHub } from '@/components/security/security-hub';
import { setRequestLocale } from 'next-intl/server';

interface SecurityPageProps {
  params: Promise<{ locale: string }>;
}

export const dynamic = 'force-dynamic';

export default async function SecurityPage({ params }: SecurityPageProps) {
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);

  return <SecurityHub />;
}
