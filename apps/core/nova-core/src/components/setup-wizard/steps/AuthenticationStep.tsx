import React, { useState, useEffect } from 'react';
import { KeyIcon, ShieldCheckIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Switch } from '../../ui/Switch';

interface AuthenticationStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
  errors: Record<string, string>;
  isLoading: boolean;
}

export const AuthenticationStep: React.FC<AuthenticationStepProps> = ({
  data,
  onUpdate,
  onComplete,
  errors,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    enableSSO: data?.authentication?.enableSSO || false,
    ssoProvider: data?.authentication?.ssoProvider || 'saml',
    enableSCIM: data?.authentication?.enableSCIM || false,
    sessionTimeout: data?.authentication?.sessionTimeout || 8 * 60 * 60, // 8 hours
    enableMFA: data?.authentication?.enableMFA || false,
    passwordPolicy: {
      minLength: data?.authentication?.passwordPolicy?.minLength || 8,
      requireUppercase: data?.authentication?.passwordPolicy?.requireUppercase || true,
      requireLowercase: data?.authentication?.passwordPolicy?.requireLowercase || true,
      requireNumbers: data?.authentication?.passwordPolicy?.requireNumbers || true,
      requireSymbols: data?.authentication?.passwordPolicy?.requireSymbols || false,
      ...data?.authentication?.passwordPolicy
    }
  });

  useEffect(() => {
    onUpdate({
      authentication: formData
    });
  }, [formData, onUpdate]);

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('passwordPolicy.')) {
      const policyField = field.replace('passwordPolicy.', '');
      setFormData(prev => ({
        ...prev,
        passwordPolicy: {
          ...prev.passwordPolicy,
          [policyField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleContinue = () => {
    onComplete();
  };

  const getSessionTimeoutHours = () => {
    return Math.floor(formData.sessionTimeout / 3600);
  };

  const setSessionTimeoutHours = (hours: number) => {
    handleInputChange('sessionTimeout', hours * 3600);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center">
          <ShieldCheckIcon className="w-8 h-8 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Authentication & Security</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Configure how users authenticate and access your platform
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Basic Authentication */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
            <KeyIcon className="w-5 h-5" />
            <span>Basic Authentication</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Session Timeout (hours)
              </label>
              <Input
                type="number"
                value={getSessionTimeoutHours()}
                onChange={(e) => setSessionTimeoutHours(parseInt(e.target.value) || 8)}
                placeholder="8"
                min="1"
                max="24"
                className="w-32"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                How long users stay logged in (1-24 hours)
              </p>
            </div>
          </div>
        </div>

        {/* Password Policy */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Password Policy</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Minimum Length
              </label>
              <Input
                type="number"
                value={formData.passwordPolicy.minLength}
                onChange={(e) => handleInputChange('passwordPolicy.minLength', parseInt(e.target.value) || 8)}
                placeholder="8"
                min="6"
                max="128"
                className="w-24"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Requirements
              </label>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={formData.passwordPolicy.requireUppercase}
                    onChange={(checked) => handleInputChange('passwordPolicy.requireUppercase', checked)}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Require uppercase letters
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <Switch
                    checked={formData.passwordPolicy.requireLowercase}
                    onChange={(checked) => handleInputChange('passwordPolicy.requireLowercase', checked)}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Require lowercase letters
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <Switch
                    checked={formData.passwordPolicy.requireNumbers}
                    onChange={(checked) => handleInputChange('passwordPolicy.requireNumbers', checked)}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Require numbers
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <Switch
                    checked={formData.passwordPolicy.requireSymbols}
                    onChange={(checked) => handleInputChange('passwordPolicy.requireSymbols', checked)}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Require symbols (!@#$%^&*)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Single Sign-On */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
            <UserGroupIcon className="w-5 h-5" />
            <span>Single Sign-On (SSO)</span>
          </h3>
          
          <div className="flex items-center space-x-3">
            <Switch
              checked={formData.enableSSO}
              onChange={(checked) => handleInputChange('enableSSO', checked)}
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Enable SSO Authentication
            </span>
          </div>

          {formData.enableSSO && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 ml-8">
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                SSO configuration will be available in the admin panel after setup is complete.
                You can configure SAML, OAuth, or LDAP providers there.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-2" htmlFor="sso-provider-select">
                    Preferred Provider
                  </label>
                  <select
                    id="sso-provider-select"
                    value={formData.ssoProvider}
                    onChange={(e) => handleInputChange('ssoProvider', e.target.value)}
                    className="block w-40 px-3 py-2 border border-blue-200 dark:border-blue-700 rounded-md text-sm bg-white dark:bg-slate-800"
                    aria-label="Select SSO provider"
                  >
                    <option value="saml">SAML 2.0</option>
                    <option value="oauth">OAuth 2.0</option>
                    <option value="ldap">LDAP</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Provisioning */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">User Provisioning</h3>
          
          <div className="flex items-center space-x-3">
            <Switch
              checked={formData.enableSCIM}
              onChange={(checked) => handleInputChange('enableSCIM', checked)}
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Enable SCIM 2.0 for automated user provisioning
            </span>
          </div>

          {formData.enableSCIM && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 ml-8">
              <p className="text-sm text-green-700 dark:text-green-300">
                SCIM endpoints will be configured automatically. You can find the endpoint URLs 
                and authentication tokens in the admin panel after setup.
              </p>
            </div>
          )}
        </div>

        {/* Multi-Factor Authentication */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Multi-Factor Authentication</h3>
          
          <div className="flex items-center space-x-3">
            <Switch
              checked={formData.enableMFA}
              onChange={(checked) => handleInputChange('enableMFA', checked)}
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Enable MFA for admin accounts
            </span>
          </div>

          {formData.enableMFA && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 ml-8">
              <p className="text-sm text-purple-700 dark:text-purple-300">
                MFA will be required for all administrator accounts. Users can set up 
                TOTP authenticator apps or SMS verification.
              </p>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ShieldCheckIcon className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                Security Best Practices
              </h4>
              <div className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                <p>• All authentication settings can be modified later in the admin panel</p>
                <p>• Consider enabling SSO and MFA for production environments</p>
                <p>• Regular security audits and password rotation are recommended</p>
                <p>• Session tokens are automatically secured with industry-standard encryption</p>
              </div>
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
