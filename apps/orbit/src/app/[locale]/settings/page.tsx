'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export default function SettingsPage(): React.ReactElement {
  const t = useTranslations('Navigation');

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-2">{t('settings')}</h1>
      <p className="text-muted-foreground mb-6">Manage your profile, preferences, and notifications.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="rounded-lg border p-4">
          <h2 className="font-semibold mb-2">Profile</h2>
          <p className="text-sm text-muted-foreground">Name, email, and password</p>
        </section>
        <section className="rounded-lg border p-4">
          <h2 className="font-semibold mb-2">Preferences</h2>
          <p className="text-sm text-muted-foreground">Language, theme, and layout</p>
        </section>
        <section className="rounded-lg border p-4">
          <h2 className="font-semibold mb-2">Notifications</h2>
          <p className="text-sm text-muted-foreground">Email and in-app alerts</p>
        </section>
        <section className="rounded-lg border p-4">
          <h2 className="font-semibold mb-2">Security</h2>
          <p className="text-sm text-muted-foreground">MFA and sessions</p>
        </section>
      </div>
    </div>
  );
}


