import SecurityPageClient from './page.client';

interface SecurityPageProps {
  params: { locale: string };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function SecurityPage(_props: SecurityPageProps) {
  return <SecurityPageClient />;
}

export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'es' },
    { locale: 'fr' },
    { locale: 'ar' }
  ];
}
