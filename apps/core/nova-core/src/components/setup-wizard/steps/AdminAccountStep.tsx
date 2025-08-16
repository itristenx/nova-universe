import React, { useState, useEffect } from 'react';
import { UserIcon, KeyIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

interface AdminAccountStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
  errors: Record<string, string>;
  isLoading: boolean;
}

export const AdminAccountStep: React.FC<AdminAccountStepProps> = ({
  data,
  onUpdate,
  onComplete,
  errors,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    email: data?.admin?.email || '',
    password: data?.admin?.password || '',
    confirmPassword: '',
    firstName: data?.admin?.firstName || '',
    lastName: data?.admin?.lastName || '',
    phone: data?.admin?.phone || '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    const valid =
      formData.email.includes('@') &&
      formData.password.length >= 8 &&
      formData.password === formData.confirmPassword &&
      formData.firstName.trim().length > 0 &&
      formData.lastName.trim().length > 0;

    setIsValid(valid);
  }, [formData]);

  useEffect(() => {
    // Calculate password strength
    let strength = 0;
    if (formData.password.length >= 8) strength += 1;
    if (/[A-Z]/.test(formData.password)) strength += 1;
    if (/[a-z]/.test(formData.password)) strength += 1;
    if (/[0-9]/.test(formData.password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;

    setPasswordStrength(strength);
  }, [formData.password]);

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Don't include confirmPassword in the data passed up
    const { confirmPassword, ...adminData } = newFormData;
    onUpdate({
      admin: adminData,
    });
  };

  const handleContinue = () => {
    if (isValid) {
      onComplete();
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-orange-500';
      case 3:
        return 'bg-yellow-500';
      case 4:
        return 'bg-blue-500';
      case 5:
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      case 5:
        return 'Very Strong';
      default:
        return '';
    }
  };

  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';

    // Ensure at least one of each type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];

    // Fill remaining characters
    for (let i = 4; i < 16; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }

    // Shuffle the password
    password = password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');

    handleInputChange('password', password);
    handleInputChange('confirmPassword', password);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/20">
          <UserIcon className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Administrator Account
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Create your administrator account to manage Nova Universe
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="flex items-center space-x-2 text-lg font-semibold text-slate-900 dark:text-white">
            <UserIcon className="h-5 w-5" />
            <span>Personal Information</span>
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                First Name *
              </label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="John"
                error={errors.firstName}
                className="w-full"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Last Name *
              </label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Doe"
                error={errors.lastName}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Address *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="admin@yourcompany.com"
                error={errors.email}
                className="w-full"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                This will be your login email
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Phone Number
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Optional - for account recovery
              </p>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="space-y-4">
          <h3 className="flex items-center space-x-2 text-lg font-semibold text-slate-900 dark:text-white">
            <ShieldCheckIcon className="h-5 w-5" />
            <span>Security</span>
          </h3>

          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password *
                </label>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={generateStrongPassword}
                  className="text-xs"
                >
                  Generate Strong Password
                </Button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a strong password"
                  error={errors.password}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-slate-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Password Strength: {getPasswordStrengthText()}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {passwordStrength}/5
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <div className="grid grid-cols-2 gap-4">
                      <div className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                        ✓ At least 8 characters
                      </div>
                      <div className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                        ✓ Uppercase letter
                      </div>
                      <div className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>
                        ✓ Lowercase letter
                      </div>
                      <div className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                        ✓ Number
                      </div>
                      <div
                        className={/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600' : ''}
                      >
                        ✓ Special character
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Confirm Password *
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  error={
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'Passwords do not match'
                      : errors.confirmPassword
                  }
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-slate-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </div>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="mt-1 flex items-center space-x-1 text-xs text-green-600">
                  <span>✓</span>
                  <span>Passwords match</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="flex items-start space-x-3">
            <KeyIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <h4 className="mb-1 text-sm font-medium text-blue-900 dark:text-blue-100">
                Admin Account Security
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                This account will have full administrative access to your Nova Universe platform.
                Make sure to use a strong, unique password and enable two-factor authentication
                after setup is complete.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleContinue}
          disabled={!isValid || isLoading}
          isLoading={isLoading}
          className="px-8"
        >
          Create Admin Account
        </Button>
      </div>
    </div>
  );
};
