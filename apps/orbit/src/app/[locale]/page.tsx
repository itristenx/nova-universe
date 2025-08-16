import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Footer } from '@/components/layout/navigation';
import { DateTimeDisplay, NumberDisplay, CulturalPreferences } from '@/components/internationalization/cultural-formatting';
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
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">{t('title')}</h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t('description')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/dashboard" 
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  {t('getStarted')}
                </Link>
                <Link 
                  href="/accessibility-audit" 
                  className="px-8 py-3 border border-border rounded-lg hover:bg-accent transition-colors font-medium"
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
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t('features')}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('featuresDescription')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    {t('internationalFeature')}
                  </CardTitle>
                  <CardDescription>
                    {t('internationalFeatureDesc')}
                  </CardDescription>
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
                    <Clock className="w-5 h-5 text-primary" />
                    {t('timeFeature')}
                  </CardTitle>
                  <CardDescription>
                    {t('timeFeatureDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>Current time: <DateTimeDisplay date={new Date()} format="time" /></div>
                    <div>Today: <DateTimeDisplay date={new Date()} format="date" /></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    {t('accessibilityFeature')}
                  </CardTitle>
                  <CardDescription>
                    {t('accessibilityFeatureDesc')}
                  </CardDescription>
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
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t('culturalAdaptation')}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('culturalAdaptationDesc')}
              </p>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">{t('formatExamples')}</h3>
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
