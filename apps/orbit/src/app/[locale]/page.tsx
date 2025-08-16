import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Footer } from '@/components/layout/navigation';
import {
  DateTimeDisplay,
  NumberDisplay,
  CulturalPreferences,
} from '@/components/internationalization/cultural-formatting';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Clock, Users } from 'lucide-react';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  const t = await getTranslations('HomePage');

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="from-primary/10 to-secondary/10 bg-gradient-to-br py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="mb-6 text-4xl font-bold md:text-6xl">{t('title')}</h1>
              <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg md:text-xl">
                {t('description')}
              </p>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-8 py-3 font-medium transition-colors"
                >
                  {t('getStarted')}
                </Link>
                <Link
                  href="/accessibility-audit"
                  className="border-border hover:bg-accent rounded-lg border px-8 py-3 font-medium transition-colors"
                >
                  {t('learnMore')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">{t('features')}</h2>
              <p className="text-muted-foreground mx-auto max-w-2xl">{t('featuresDescription')}</p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="text-primary h-5 w-5" />
                    {t('internationalFeature')}
                  </CardTitle>
                  <CardDescription>{t('internationalFeatureDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="outline">English</Badge>
                    <Badge variant="outline">Español</Badge>
                    <Badge variant="outline">Français</Badge>
                    <Badge variant="outline">العربية</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="text-primary h-5 w-5" />
                    {t('timeFeature')}
                  </CardTitle>
                  <CardDescription>{t('timeFeatureDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      Current time: <DateTimeDisplay date={new Date()} format="time" />
                    </div>
                    <div>
                      Today: <DateTimeDisplay date={new Date()} format="date" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="text-primary h-5 w-5" />
                    {t('accessibilityFeature')}
                  </CardTitle>
                  <CardDescription>{t('accessibilityFeatureDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="secondary">WCAG 2.1 AA</Badge>
                    <Badge variant="secondary">Screen Readers</Badge>
                    <Badge variant="secondary">Keyboard Navigation</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Cultural Preferences Demo */}
        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">{t('culturalAdaptation')}</h2>
              <p className="text-muted-foreground mx-auto max-w-2xl">
                {t('culturalAdaptationDesc')}
              </p>
            </div>

            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 lg:grid-cols-2">
              <div>
                <h3 className="mb-4 text-xl font-semibold">{t('formatExamples')}</h3>
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Date:</span>
                          <div className="font-medium">
                            <DateTimeDisplay date={new Date()} format="date" />
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Time:</span>
                          <div className="font-medium">
                            <DateTimeDisplay date={new Date()} format="time" />
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Number:</span>
                          <div className="font-medium">
                            <NumberDisplay value={1234.56} />
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Currency:</span>
                          <div className="font-medium">
                            <NumberDisplay value={1234.56} format="currency" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <CulturalPreferences />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
