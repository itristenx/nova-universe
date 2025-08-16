import React, { useState, useEffect } from 'react';
import { EnvelopeIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Switch } from '../../ui/Switch';

interface EmailStepProps {
  data: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types;
  onUpdate: (data: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => void;
  onComplete: () => void;
  errors: Record<string, string>;
  isLoading: boolean;
}

export const EmailStep: React.FC<EmailStepProps> = ({
  data,
  onUpdate,
  onComplete,
  errors,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    provider: data?.email?.provider || 'console',
    host: data?.email?.host || '',
    port: data?.email?.port || 587,
    username: data?.email?.username || '',
    password: data?.email?.password || '',
    apiKey: data?.email?.apiKey || '',
    fromEmail: data?.email?.fromEmail || '',
    fromName: data?.email?.fromName || '',
    secure: data?.email?.secure || false
  });

  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connectionError, setConnectionError] = useState<string>('');

  useEffect(() => {
    onUpdate({
      email: formData
    });
  }, [formData, onUpdate]);

  const handleInputChange = (field: string, value: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setConnectionStatus('idle');
    setConnectionError('');
  };

  const testEmailConnection = async () => {
    if (formData.provider === 'console') {
      setConnectionStatus('success');
      return;
    }

    setConnectionStatus('testing');
    setConnectionError('');
    
    try {
      const response = await fetch('/api/setup/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      }); // TODO-LINT: move to async function

      const result = await response.json(); // TODO-LINT: move to async function
      
      if (result.success) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
        setConnectionError(result.error || 'Failed to test email configuration');
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionError('Unable to test email connection. Please check your configuration.');
    }
  };

  const handleContinue = () => {
    onComplete();
  };

  const getDefaultPort = () => {
    switch (formData.provider) {
      case 'smtp': return formData.secure ? 465 : 587;
      default: return 587;
    }
  };

  const emailProviders = [
    {
      id: 'console',
      name: 'Console/Development',
      description: 'Emails will be logged to console (development only)',
      icon: '🖥️'
    },
    {
      id: 'smtp',
      name: 'SMTP Server',
      description: 'Use a custom SMTP server',
      icon: '📧'
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      description: 'SendGrid email service',
      icon: '📨'
    },
    {
      id: 'ses',
      name: 'Amazon SES',
      description: 'Amazon Simple Email Service',
      icon: '🚀'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center">
          <EnvelopeIcon className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Email & Notifications</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Configure email delivery for notifications and alerts
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Provider Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Email Provider</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emailProviders.map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleInputChange('provider', provider.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  formData.provider === provider.id
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="text-2xl mb-2">{provider.icon}</div>
                <h4 className="font-medium text-slate-900 dark:text-white">{provider.name}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{provider.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Email Configuration */}
        {formData.provider !== 'console' && (
          <div className="space-y-6">
            {/* Basic Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Email Settings</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    From Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.fromEmail}
                    onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                    placeholder="noreply@yourcompany.com"
                    error={errors.fromEmail}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    From Name *
                  </label>
                  <Input
                    value={formData.fromName}
                    onChange={(e) => handleInputChange('fromName', e.target.value)}
                    placeholder="Nova Universe Support"
                    error={errors.fromName}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Provider-specific Configuration */}
            {formData.provider === 'smtp' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">SMTP Configuration</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Host *
                    </label>
                    <Input
                      value={formData.host}
                      onChange={(e) => handleInputChange('host', e.target.value)}
                      placeholder="smtp.gmail.com"
                      error={errors.host}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Port *
                    </label>
                    <Input
                      type="number"
                      value={formData.port}
                      onChange={(e) => handleInputChange('port', parseInt(e.target.value) || getDefaultPort())}
                      placeholder={getDefaultPort().toString()}
                      error={errors.port}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Username
                    </label>
                    <Input
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="your-email@gmail.com"
                      error={errors.username}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Password
                    </label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter SMTP password"
                      error={errors.password}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Switch
                    checked={formData.secure}
                    onChange={(checked) => handleInputChange('secure', checked)}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Use secure connection (SSL/TLS)
                  </span>
                </div>
              </div>
            )}

            {(formData.provider === 'sendgrid' || formData.provider === 'ses') && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {formData.provider === 'sendgrid' ? 'SendGrid' : 'Amazon SES'} Configuration
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    API Key *
                  </label>
                  <Input
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => handleInputChange('apiKey', e.target.value)}
                    placeholder={`Enter your ${formData.provider === 'sendgrid' ? 'SendGrid' : 'AWS'} API key`}
                    error={errors.apiKey}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {formData.provider === 'sendgrid' 
                      ? 'Get your API key from SendGrid dashboard' 
                      : 'Use your AWS access key with SES permissions'
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Connection Test */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Connection Test</h3>
                <Button
                  variant="bordered"
                  onClick={testEmailConnection}
                  disabled={connectionStatus === 'testing'}
                  isLoading={connectionStatus === 'testing'}
                >
                  Test Email Configuration
                </Button>
              </div>

              {/* Connection Status */}
              {connectionStatus !== 'idle' && (
                <div className={`rounded-lg p-4 ${
                  connectionStatus === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20' 
                    : connectionStatus === 'error'
                    ? 'bg-red-50 dark:bg-red-900/20'
                    : 'bg-blue-50 dark:bg-blue-900/20'
                }`}>
                  <div className="flex items-center space-x-3">
                    {connectionStatus === 'success' && (
                      <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                    )}
                    {connectionStatus === 'error' && (
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h4 className={`text-sm font-medium mb-1 ${
                        connectionStatus === 'success' 
                          ? 'text-green-800 dark:text-green-200'
                          : 'text-red-800 dark:text-red-200'
                      }`}>
                        {connectionStatus === 'success' 
                          ? 'Email Configuration Valid!' 
                          : 'Configuration Test Failed'
                        }
                      </h4>
                      <p className={`text-sm ${
                        connectionStatus === 'success' 
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-red-700 dark:text-red-300'
                      }`}>
                        {connectionStatus === 'success' 
                          ? 'Email notifications are ready to be sent'
                          : connectionError
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Console Mode Notice */}
        {formData.provider === 'console' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Development Mode
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Emails will be logged to the console instead of being sent. This is great for 
                  development and testing, but you'll want to configure a real email provider 
                  for production use.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Email Templates Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <EnvelopeIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                Email Templates
              </h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <p>• Welcome emails for new users</p>
                <p>• Password reset notifications</p>
                <p>• Ticket creation and update notifications</p>
                <p>• System alerts and maintenance notifications</p>
                <p className="mt-2">All templates can be customized in the admin panel after setup.</p>
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
