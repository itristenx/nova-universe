'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export default function SettingsPage(): React.ReactElement {
  const t = useTranslations('Navigation');

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">{t('settings')}</h1>
      <p className="text-muted-foreground mb-6">
        Manage your profile, preferences, and notifications.
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">Profile</h2>
          <p className="text-muted-foreground text-sm">Name, email, and password</p>
        </section>
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">Preferences</h2>
          <p className="text-muted-foreground text-sm">Language, theme, and layout</p>
        </section>
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">Notifications</h2>
          <p className="text-muted-foreground text-sm">Email and in-app alerts</p>
        </section>
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">Security</h2>
          <p className="text-muted-foreground text-sm">MFA and sessions</p>
        </section>
      </div>
    </div>
  );
}
