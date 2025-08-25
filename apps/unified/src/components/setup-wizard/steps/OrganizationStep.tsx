import React, { useState, useCallback } from 'react';
import {
  Building2,
  Globe,
  Palette,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface OrganizationStepProps {
  config: any;
  updateConfig: (updates: any) => void;
  validation: any;
  isLoading: boolean;
  sessionId: string | null;
  collapsedSections: Set<string>;
  toggleSection: (sectionId: string) => void;
}

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    className={`rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}
  >
    {children}
  </div>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`p-6 ${className}`}>{children}</div>;

const CollapsibleSection: React.FC<{
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  required?: boolean;
}> = ({ id, title, description, icon, isExpanded, onToggle, children, required = false }) => (
  <Card className="overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
      aria-expanded={isExpanded ? 'true' : 'false'}
      aria-controls={`section-${id}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {icon}
          <div>
            <h3 className="flex items-center space-x-2 font-medium text-gray-900 dark:text-white">
              <span>{title}</span>
              {required && <span className="text-sm text-red-500">*</span>}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </div>
    </button>
    {isExpanded && (
      <div id={`section-${id}`} className="border-t border-gray-200 dark:border-gray-700">
        <CardContent>{children}</CardContent>
      </div>
    )}
  </Card>
);

const FormField: React.FC<{
  label: string;
  required?: boolean;
  description?: string;
  error?: string;
  children: React.ReactNode;
}> = ({ label, required = false, description, error, children }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-900 dark:text-white">
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
    {description && <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>}
    {children}
    {error && (
      <div className="flex items-center space-x-1 text-sm text-red-600">
        <AlertCircle className="h-4 w-4" />
        <span>{error}</span>
      </div>
    )}
  </div>
);

const Input: React.FC<{
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}> = ({ type = 'text', placeholder, value, onChange, className = '' }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 ${className}`}
  />
);

const Textarea: React.FC<{
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  className?: string;
}> = ({ placeholder, value, onChange, rows = 3, className = '' }) => (
  <textarea
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    rows={rows}
    className={`resize-vertical w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 ${className}`}
  />
);

export const OrganizationStep: React.FC<OrganizationStepProps> = ({
  config,
  updateConfig,
  validation,
  collapsedSections,
  toggleSection,
}) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const isExpanded = useCallback(
    (sectionId: string) => {
      return !collapsedSections.has(sectionId);
    },
    [collapsedSections],
  );

  const handleInputChange = useCallback(
    (field: string, value: string) => {
      updateConfig({
        organization: {
          ...config.organization,
          [field]: value,
        },
      });
    },
    [config.organization, updateConfig],
  );

  const handleLogoUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setLogoPreview(result);
          updateConfig({
            organization: {
              ...config.organization,
              logo: result,
            },
          });
        };
        reader.readAsDataURL(file);
      }
    },
    [config.organization, updateConfig],
  );

  const getFieldError = (field: string) => {
    return validation?.errors?.find((error: string) =>
      error.toLowerCase().includes(field.toLowerCase()),
    );
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <CollapsibleSection
        id="basic-info"
        title="Basic Information"
        description="Essential details about your organization"
        icon={<Building2 className="h-5 w-5 text-blue-500" />}
        isExpanded={isExpanded('basic-info')}
        onToggle={() => toggleSection('basic-info')}
        required
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            label="Organization Name"
            required
            description="The official name of your organization"
            error={getFieldError('organization name')}
          >
            <Input
              placeholder="Acme Corporation"
              value={config.organization?.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </FormField>

          <FormField
            label="Display Name"
            description="Short name shown in the interface"
            error={getFieldError('display name')}
          >
            <Input
              placeholder="Acme"
              value={config.organization?.displayName || ''}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
            />
          </FormField>

          <FormField label="Industry" description="Your organization's primary industry">
            <Input
              placeholder="Technology, Healthcare, Finance, etc."
              value={config.organization?.industry || ''}
              onChange={(e) => handleInputChange('industry', e.target.value)}
            />
          </FormField>

          <FormField label="Organization Size" description="Approximate number of employees">
            <select
              value={config.organization?.size || ''}
              onChange={(e) => handleInputChange('size', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              aria-label="Organization size"
            >
              <option value="">Select size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-1000">201-1000 employees</option>
              <option value="1000+">1000+ employees</option>
            </select>
          </FormField>
        </div>

        <FormField label="Description" description="Brief description of your organization">
          <Textarea
            placeholder="Describe your organization's mission and primary activities..."
            value={config.organization?.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
          />
        </FormField>
      </CollapsibleSection>

      {/* Contact Information */}
      <CollapsibleSection
        id="contact-info"
        title="Contact Information"
        description="Primary contact details for your organization"
        icon={<Globe className="h-5 w-5 text-green-500" />}
        isExpanded={isExpanded('contact-info')}
        onToggle={() => toggleSection('contact-info')}
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            label="Website"
            description="Your organization's website URL"
            error={getFieldError('website')}
          >
            <Input
              type="url"
              placeholder="https://example.com"
              value={config.organization?.website || ''}
              onChange={(e) => handleInputChange('website', e.target.value)}
            />
          </FormField>

          <FormField
            label="Support Email"
            description="Primary email for IT support requests"
            error={getFieldError('support email')}
          >
            <Input
              type="email"
              placeholder="support@example.com"
              value={config.organization?.supportEmail || ''}
              onChange={(e) => handleInputChange('supportEmail', e.target.value)}
            />
          </FormField>

          <FormField label="Phone Number" description="Main phone number for support">
            <Input
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={config.organization?.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </FormField>

          <FormField label="Time Zone" description="Primary time zone for your organization">
            <select
              value={config.organization?.timezone || ''}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              aria-label="Time zone"
            >
              <option value="">Select timezone</option>
              <option value="America/New_York">Eastern Time (EST/EDT)</option>
              <option value="America/Chicago">Central Time (CST/CDT)</option>
              <option value="America/Denver">Mountain Time (MST/MDT)</option>
              <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
              <option value="UTC">UTC</option>
              <option value="Europe/London">GMT (London)</option>
              <option value="Europe/Paris">CET (Paris)</option>
              <option value="Asia/Tokyo">JST (Tokyo)</option>
            </select>
          </FormField>
        </div>
      </CollapsibleSection>

      {/* Branding */}
      <CollapsibleSection
        id="branding"
        title="Branding & Appearance"
        description="Customize the look and feel of your Nova Universe instance"
        icon={<Palette className="h-5 w-5 text-purple-500" />}
        isExpanded={isExpanded('branding')}
        onToggle={() => toggleSection('branding')}
      >
        <div className="space-y-6">
          <FormField
            label="Organization Logo"
            description="Upload your organization's logo (recommended: 200x60px, PNG/SVG)"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  aria-label="Upload organization logo"
                />
              </div>
              {logoPreview && (
                <div className="flex h-16 w-24 items-center justify-center overflow-hidden rounded-md border border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
            </div>
          </FormField>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <FormField label="Primary Color" description="Main brand color (hex code)">
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={config.organization?.primaryColor || '#3b82f6'}
                  onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                  className="h-10 w-12 rounded-md border border-gray-300 dark:border-gray-600"
                  aria-label="Primary color picker"
                />
                <Input
                  placeholder="#3b82f6"
                  value={config.organization?.primaryColor || ''}
                  onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                />
              </div>
            </FormField>

            <FormField label="Secondary Color" description="Secondary brand color">
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={config.organization?.secondaryColor || '#64748b'}
                  onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                  className="h-10 w-12 rounded-md border border-gray-300 dark:border-gray-600"
                  aria-label="Secondary color picker"
                />
                <Input
                  placeholder="#64748b"
                  value={config.organization?.secondaryColor || ''}
                  onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                />
              </div>
            </FormField>

            <FormField label="Accent Color" description="Accent color for highlights">
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={config.organization?.accentColor || '#10b981'}
                  onChange={(e) => handleInputChange('accentColor', e.target.value)}
                  className="h-10 w-12 rounded-md border border-gray-300 dark:border-gray-600"
                  aria-label="Accent color picker"
                />
                <Input
                  placeholder="#10b981"
                  value={config.organization?.accentColor || ''}
                  onChange={(e) => handleInputChange('accentColor', e.target.value)}
                />
              </div>
            </FormField>
          </div>
        </div>
      </CollapsibleSection>

      {/* Help & Documentation */}
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
        <CardContent>
          <div className="flex items-start space-x-3">
            <HelpCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <h3 className="mb-2 font-medium text-amber-900 dark:text-amber-100">Need Help?</h3>
              <div className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
                <p>• All fields can be updated later in the organization settings</p>
                <p>• Your logo should be optimized for web display (PNG or SVG recommended)</p>
                <p>• Brand colors will be applied throughout the Nova Universe interface</p>
                <p>• Support email will be used for system notifications and user communications</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Summary */}
      {validation && (
        <Card
          className={`border-l-4 ${
            validation.valid
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-red-500 bg-red-50 dark:bg-red-900/20'
          }`}
        >
          <CardContent>
            <div className="flex items-center space-x-2">
              {validation.valid ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <h3
                className={`font-medium ${
                  validation.valid
                    ? 'text-green-900 dark:text-green-100'
                    : 'text-red-900 dark:text-red-100'
                }`}
              >
                {validation.valid
                  ? 'Organization Configuration Valid'
                  : 'Configuration Issues Found'}
              </h3>
            </div>
            {!validation.valid && validation.errors && (
              <ul className="mt-2 space-y-1 text-sm text-red-800 dark:text-red-200">
                {validation.errors.map((error: string, index: number) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
