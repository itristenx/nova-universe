import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MainNavigation } from '../../layout/navigation';

jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('@/i18n/routing', () => ({
  routing: { locales: ['en', 'es', 'fr', 'ar'] },
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('MainNavigation', () => {
  it('renders primary navigation and links', () => {
    render(<MainNavigation />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Navigation.home')).toBeInTheDocument();
    expect(screen.getByText('Navigation.dashboard')).toBeInTheDocument();
    expect(screen.getByText('Navigation.settings')).toBeInTheDocument();
    expect(screen.getByText('Navigation.security')).toBeInTheDocument();
    expect(screen.getByText('Navigation.accessibility')).toBeInTheDocument();
  });
});
