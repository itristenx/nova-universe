"use client";
import React from 'react';
import { MainNavigation, Footer } from '@/components/layout/navigation';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <MainNavigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}