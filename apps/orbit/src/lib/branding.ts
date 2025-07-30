// BrandingConfig structure for tenant branding
export type BrandingConfig = {
  tenantId: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  welcomeMessage?: string;
  helpText: string;
  fallbackToNova: boolean;
};

// Example: default Nova branding
export const defaultBranding: BrandingConfig = {
  tenantId: 'nova',
  logoUrl: '/nova-logo-light.png',
  primaryColor: '#3b82f6',
  secondaryColor: '#6366f1',
  welcomeMessage: 'Welcome to Nova Orbit!',
  helpText: 'Need help? Explore our documentation or contact support.',
  fallbackToNova: true,
};
