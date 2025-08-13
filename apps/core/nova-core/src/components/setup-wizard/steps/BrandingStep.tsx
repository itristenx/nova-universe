import React, { useState, useEffect, useRef } from 'react';
import { PaintBrushIcon, PhotoIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Switch } from '../../ui/Switch';

interface BrandingStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
  errors: Record<string, string>;
  isLoading: boolean;
}

export const BrandingStep: React.FC<BrandingStepProps> = ({
  data,
  onUpdate,
  onComplete,
  errors,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    // Logo and Branding
    companyLogo: data?.branding?.companyLogo || null,
    companyName: data?.branding?.companyName || '',
    tagline: data?.branding?.tagline || '',
    
    // Colors
    primaryColor: data?.branding?.primaryColor || '#6366f1',
    secondaryColor: data?.branding?.secondaryColor || '#8b5cf6',
    accentColor: data?.branding?.accentColor || '#06b6d4',
    
    // Theme Options
    darkModeEnabled: data?.branding?.darkModeEnabled !== false,
    customThemeEnabled: data?.branding?.customThemeEnabled || false,
    customCss: data?.branding?.customCss || '',
    
    // Portal Customization
    portalTitle: data?.branding?.portalTitle || 'Support Portal',
    portalSubtitle: data?.branding?.portalSubtitle || 'Get help from our team',
    welcomeMessage: data?.branding?.welcomeMessage || 'Welcome to our support portal. How can we help you today?',
    
    // Footer and Links
    companyWebsite: data?.branding?.companyWebsite || '',
    privacyPolicyUrl: data?.branding?.privacyPolicyUrl || '',
    termsOfServiceUrl: data?.branding?.termsOfServiceUrl || '',
    
    // Advanced
    customFavicon: data?.branding?.customFavicon || null,
    customFonts: data?.branding?.customFonts || false,
    fontFamily: data?.branding?.fontFamily || 'Inter'
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onUpdate({
      branding: formData
    });
  }, [formData, onUpdate]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleInputChange('companyLogo', file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleInputChange('customFavicon', file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFaviconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = () => {
    onComplete();
  };

  const presetThemes = [
    {
      name: 'Nova (Default)',
      colors: { primary: '#6366f1', secondary: '#8b5cf6', accent: '#06b6d4' }
    },
    {
      name: 'Ocean',
      colors: { primary: '#0ea5e9', secondary: '#06b6d4', accent: '#8b5cf6' }
    },
    {
      name: 'Forest',
      colors: { primary: '#059669', secondary: '#10b981', accent: '#34d399' }
    },
    {
      name: 'Sunset',
      colors: { primary: '#ea580c', secondary: '#f97316', accent: '#fb923c' }
    },
    {
      name: 'Professional',
      colors: { primary: '#475569', secondary: '#64748b', accent: '#94a3b8' }
    }
  ];

  const applyPresetTheme = (theme: any) => {
    setFormData(prev => ({
      ...prev,
      primaryColor: theme.colors.primary,
      secondaryColor: theme.colors.secondary,
      accentColor: theme.colors.accent
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-pink-100 dark:bg-pink-900/20 rounded-2xl flex items-center justify-center">
          <PaintBrushIcon className="w-8 h-8 text-pink-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Branding & Appearance</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Customize your platform's look and feel to match your brand
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-8">
        {/* Company Branding */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Company Branding</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Company Logo
              </label>
              <div 
                onClick={() => logoInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
              >
                {logoPreview ? (
                  <div className="space-y-2">
                    <img src={logoPreview} alt="Logo preview" className="h-16 mx-auto object-contain" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">Click to change logo</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <PhotoIcon className="w-12 h-12 text-slate-400 mx-auto" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">Click to upload logo</p>
                  </div>
                )}
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                aria-label="Upload company logo"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Recommended: PNG or SVG, max 2MB
              </p>
            </div>

            {/* Company Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Company Name *
                </label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Your Company Name"
                  error={errors.companyName}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tagline
                </label>
                <Input
                  value={formData.tagline}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                  placeholder="Your company tagline"
                  error={errors.tagline}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Website
                </label>
                <Input
                  type="url"
                  value={formData.companyWebsite}
                  onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                  placeholder="https://yourcompany.com"
                  error={errors.companyWebsite}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Color Theme */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Color Theme</h3>
          
          {/* Preset Themes */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-slate-900 dark:text-white">Quick Themes</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {presetThemes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => applyPresetTheme(theme)}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors text-left"
                >
                  <div className="flex space-x-1 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: theme.colors.primary }} // eslint-disable-line no-inline-styles
                    />
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: theme.colors.secondary }} // eslint-disable-line no-inline-styles
                    />
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: theme.colors.accent }} // eslint-disable-line no-inline-styles
                    />
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{theme.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-slate-900 dark:text-white">Custom Colors</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Primary Color
                </label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="w-12 h-10 rounded border border-slate-300 dark:border-slate-600"
                    aria-label="Primary color picker"
                    title="Select primary color"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    placeholder="#6366f1"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Secondary Color
                </label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="w-12 h-10 rounded border border-slate-300 dark:border-slate-600"
                    aria-label="Secondary color picker"
                    title="Select secondary color"
                  />
                  <Input
                    value={formData.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    placeholder="#8b5cf6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Accent Color
                </label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => handleInputChange('accentColor', e.target.value)}
                    className="w-12 h-10 rounded border border-slate-300 dark:border-slate-600"
                    aria-label="Accent color picker"
                    title="Select accent color"
                  />
                  <Input
                    value={formData.accentColor}
                    onChange={(e) => handleInputChange('accentColor', e.target.value)}
                    placeholder="#06b6d4"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Theme Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">Dark Mode Support</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Allow users to switch between light and dark themes
                </p>
              </div>
              <Switch
                checked={formData.darkModeEnabled}
                onChange={(checked) => handleInputChange('darkModeEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">Custom Theme</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Enable advanced theme customization
                </p>
              </div>
              <Switch
                checked={formData.customThemeEnabled}
                onChange={(checked) => handleInputChange('customThemeEnabled', checked)}
              />
            </div>

            {formData.customThemeEnabled && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Custom CSS
                </label>
                <textarea
                  value={formData.customCss}
                  onChange={(e) => handleInputChange('customCss', e.target.value)}
                  placeholder="/* Add your custom CSS here */"
                  rows={6}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Advanced users only. Invalid CSS may break the interface.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Portal Customization */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Portal Customization</h3>
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Portal Title
                </label>
                <Input
                  value={formData.portalTitle}
                  onChange={(e) => handleInputChange('portalTitle', e.target.value)}
                  placeholder="Support Portal"
                  error={errors.portalTitle}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Portal Subtitle
                </label>
                <Input
                  value={formData.portalSubtitle}
                  onChange={(e) => handleInputChange('portalSubtitle', e.target.value)}
                  placeholder="Get help from our team"
                  error={errors.portalSubtitle}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Welcome Message
              </label>
              <textarea
                value={formData.welcomeMessage}
                onChange={(e) => handleInputChange('welcomeMessage', e.target.value)}
                placeholder="Welcome to our support portal. How can we help you today?"
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Legal & Links</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Privacy Policy URL
              </label>
              <Input
                type="url"
                value={formData.privacyPolicyUrl}
                onChange={(e) => handleInputChange('privacyPolicyUrl', e.target.value)}
                placeholder="https://yourcompany.com/privacy"
                error={errors.privacyPolicyUrl}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Terms of Service URL
              </label>
              <Input
                type="url"
                value={formData.termsOfServiceUrl}
                onChange={(e) => handleInputChange('termsOfServiceUrl', e.target.value)}
                placeholder="https://yourcompany.com/terms"
                error={errors.termsOfServiceUrl}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <EyeIcon className="w-5 h-5 text-slate-600" />
            <h4 className="font-medium text-slate-900 dark:text-white">Preview</h4>
          </div>
          
          <div 
            className="bg-white dark:bg-slate-900 rounded-lg border p-6 text-center"
            style={{
              borderColor: formData.primaryColor,
              borderWidth: '2px'
            }}
          >
            {logoPreview && (
              <img src={logoPreview} alt="Logo" className="h-12 mx-auto mb-4 object-contain" />
            )}
            <h2 
              className="text-xl font-bold mb-2"
              style={{ color: formData.primaryColor }} // eslint-disable-line no-inline-styles
            >
              {formData.companyName || 'Your Company'}
            </h2>
            {formData.tagline && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{formData.tagline}</p>
            )}
            <div 
              className="inline-block px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: formData.primaryColor }} // eslint-disable-line no-inline-styles
            >
              {formData.portalTitle}
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleContinue}
          disabled={isLoading}
          isLoading={isLoading}
          className="px-8"
        >
          Continue Setup
        </Button>
      </div>
    </div>
  );
};
