import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "../styles/design-tokens.css";
import "../styles/accessibility.css";
import { KioskRedirect } from "../components/KioskRedirect";
import { PWAInstaller } from "../components/PWAInstaller";
import { defaultBranding } from "../lib/branding";
import { OutageBanner } from "../components/OutageBanner";
import { ClientInit } from "../components/ClientInit";
import { SkipLinks } from "../components/accessibility/skip-links";

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nova Universe - IT Service Management",
  description: "Advanced IT Service Management platform with AI-powered automation and intelligent workflows",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nova Universe",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "msapplication-TileColor": "#1e40af",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${interSans.variable} ${jetbrainsMono.variable} antialiased branding-theme shadcn-theme`}
        data-color-primary={defaultBranding.primaryColor}
        data-color-secondary={defaultBranding.secondaryColor}
      >
        <SkipLinks />
        {/* Client-only initializers */}
        <ClientInit />
        <OutageBanner />
        <PWAInstaller />
        <KioskRedirect />
        <main id="main-content" role="main">
          {children}
        </main>
      </body>
    </html>
  );
}
