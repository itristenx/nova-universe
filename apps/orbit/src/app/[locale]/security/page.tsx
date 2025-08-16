import { SecurityHub } from '@/components/security/security-hub';
import { setRequestLocale } from 'next-intl/server';

interface SecurityPageProps {
  params: Promise<{ locale: string }>;
}

export default async function _SecurityPage({ params }: SecurityPageProps) {
  const { locale } = await params; // TODO-LINT: move to async function
  
  // Enable static rendering
  setRequestLocale(locale);

  return <SecurityHub />;
}

export function _generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'es' },
    { locale: 'fr' },
    { locale: 'ar' }
  ];
}
