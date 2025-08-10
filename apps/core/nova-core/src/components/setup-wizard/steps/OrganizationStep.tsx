import React, { useState, useEffect } from 'react';
import { BuildingOfficeIcon, GlobeAltIcon, PaintBrushIcon } from '@heroicons/react/24/outline';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

interface OrganizationStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
  errors: Record<string, string>;
  isLoading: boolean;
}

export const OrganizationStep: React.FC<OrganizationStepProps> = ({
  data,
  onUpdate,
  onComplete,
  errors,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    name: data?.organization?.name || '',
    domain: data?.organization?.domain || '',
    logoUrl: data?.organization?.logoUrl || '/logo.png',
    primaryColor: data?.organization?.primaryColor || '#276EF1',
    secondaryColor: data?.organization?.secondaryColor || '#B8A1FF',
    welcomeMessage: data?.organization?.welcomeMessage || 'Welcome to our Help Desk',
    helpMessage: data?.organization?.helpMessage || 'Need to report an issue? We\'re here to help!'
  });

  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const valid = formData.name.trim().length > 0 && formData.domain.trim().length > 0;
    setIsValid(valid);
  }, [formData]);

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    onUpdate({
      organization: newFormData
    });
  };

  const handleContinue = () => {
    if (isValid) {
      onComplete();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
          <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Organization Setup</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Configure your organization details and basic branding
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
            <BuildingOfficeIcon className="w-5 h-5" />
            <span>Basic Information</span>
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Organization Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Acme Corporation"
                error={errors.organizationName}
                className="w-full"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                This will appear in your platform header and emails
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Domain *
              </label>
              <Input
                value={formData.domain}
                onChange={(e) => handleInputChange('domain', e.target.value)}
                placeholder="acme.com"
                error={errors.domain}
                className="w-full"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Used for default email addresses and configurations
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
            <GlobeAltIcon className="w-5 h-5" />
            <span>Welcome Messages</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Welcome Message
              </label>
              <Input
                value={formData.welcomeMessage}
                onChange={(e) => handleInputChange('welcomeMessage', e.target.value)}
                placeholder="Welcome to our Help Desk"
                className="w-full"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Shown on the main portal page
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Help Message
              </label>
              <Input
                value={formData.helpMessage}
                onChange={(e) => handleInputChange('helpMessage', e.target.value)}
                placeholder="Need to report an issue? We're here to help!"
                className="w-full"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Shown on ticket submission forms
              </p>
            </div>
          </div>
        </div>

        {/* Basic Branding */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
            <PaintBrushIcon className="w-5 h-5" />
            <span>Basic Branding</span>
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Primary Color
              </label>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-10 rounded-lg border border-slate-300 dark:border-slate-600"
                  style={{ backgroundColor: formData.primaryColor }}
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                  placeholder="#276EF1"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Used for buttons and primary UI elements
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Secondary Color
              </label>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-10 rounded-lg border border-slate-300 dark:border-slate-600"
                  style={{ backgroundColor: formData.secondaryColor }}
                />
                <Input
                  value={formData.secondaryColor}
                  onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                  placeholder="#B8A1FF"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Used for accents and secondary elements
              </p>
            </div>
          </div>
        </div>

        {/* Logo Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Logo Configuration</h3>
          
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center">
                <img 
                  src={formData.logoUrl} 
                  alt="Logo preview"
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Logo URL
                </label>
                <Input
                  value={formData.logoUrl}
                  onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                  placeholder="/logo.png"
                  className="w-full"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  We'll help you upload a custom logo in the branding step
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 rounded-lg p-6">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">Preview</h4>
          <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src={formData.logoUrl} 
                alt="Logo"
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />
              <span className="font-semibold text-slate-900 dark:text-white">
                {formData.name || 'Your Organization'}
              </span>
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              {formData.welcomeMessage}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              {formData.helpMessage}
            </p>
            <Button 
              variant="solid"
              size="sm"
              style={{ backgroundColor: formData.primaryColor }}
            >
              Submit Request
            </Button>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button
          variant="solid"
          onClick={handleContinue}
          disabled={!isValid || isLoading}
          isLoading={isLoading}
          className="px-8"
        >
          Continue Setup
        </Button>
      </div>
    </div>
  );
};
