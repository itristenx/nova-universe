'use client';

import React from 'react';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function SkipLink({ href, children, className = '' }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={`skip-link ${className}`}
      onFocus={(e) => {
        // Ensure skip link is visible when focused
        e.currentTarget.style.top = '6px';
      }}
      onBlur={(e) => {
        // Hide skip link when focus is lost
        e.currentTarget.style.top = '-40px';
      }}
    >
      {children}
    </a>
  );
}

export function _SkipLinks() {
  return (
    <>
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#main-navigation">Skip to navigation</SkipLink>
      <SkipLink href="#search">Skip to search</SkipLink>
    </>
  );
}
