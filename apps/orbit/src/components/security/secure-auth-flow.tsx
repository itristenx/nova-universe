'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Smartphone,
  Mail,
  Key,
  Timer,
  RefreshCw
} from 'lucide-react';

interface AuthStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'current' | 'completed' | 'error';
  optional?: boolean;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
  };
}

export function SecureAuthFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const authSteps: AuthStep[] = [
    {
      id: 'credentials',
      title: 'Account Credentials',
      description: 'Enter your email and create a secure password',
      status: currentStep === 0 ? 'current' : currentStep > 0 ? 'completed' : 'pending'
    },
    {
      id: 'verification',
      title: 'Email Verification',
      description: 'Verify your email address',
      status: currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'pending'
    },
    {
      id: 'two-factor',
      title: 'Two-Factor Authentication',
      description: 'Set up additional security (recommended)',
      status: currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'pending',
      optional: true
    },
    {
      id: 'complete',
      title: 'Security Setup Complete',
      description: 'Your account is now secure',
      status: currentStep === 3 ? 'completed' : 'pending'
    }
  ];

  // Password strength calculator
  const calculatePasswordStrength = (pwd: string): PasswordStrength => {
    const requirements = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      numbers: /\d/.test(pwd),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    };

    const score = Object.values(requirements).filter(Boolean).length;
    
    const strengthLevels = [
      { label: 'Very Weak', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-orange-500' },
      { label: 'Fair', color: 'bg-yellow-500' },
      { label: 'Good', color: 'bg-blue-500' },
      { label: 'Strong', color: 'bg-green-500' }
    ];

    return {
      score,
      label: strengthLevels[score] ? strengthLevels[score].label : 'Very Weak',
      color: strengthLevels[score] ? strengthLevels[score].color : 'bg-red-500',
      requirements
    };
  };

  const passwordStrength = calculatePasswordStrength(password);

  // Countdown timer for verification code resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleNext = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000)); // TODO-LINT: move to async function
    setCurrentStep(prev => prev + 1);
    setIsLoading(false);

    if (currentStep === 0) {
      setCountdown(60); // Start countdown for email verification
    }
  };

  const handleResendCode = () => {
    setCountdown(60);
    // Simulate resending verification code
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Credentials
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Password Strength:</span>
                    <Badge variant={passwordStrength.score >= 4 ? 'default' : 'secondary'}>
                      {passwordStrength.label}
                    </Badge>
                  </div>
                  <Progress value={(passwordStrength.score / 5) * 100} className="h-2" />
                  
                  <div className="text-xs space-y-1">
                    {Object.entries(passwordStrength.requirements).map(([req, met]) => (
                      <div key={req} className="flex items-center gap-2">
                        {met ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span className={met ? 'text-green-600' : 'text-red-600'}>
                          {req === 'length' && 'At least 8 characters'}
                          {req === 'uppercase' && 'One uppercase letter'}
                          {req === 'lowercase' && 'One lowercase letter'}
                          {req === 'numbers' && 'One number'}
                          {req === 'symbols' && 'One special character'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                />
                {confirmPassword && (
                  <div className="absolute right-3 top-3">
                    {password === confirmPassword ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-red-600">Passwords do not match</p>
              )}
            </div>
          </div>
        );

      case 1: // Email Verification
        return (
          <div className="space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Check Your Email</h3>
              <p className="text-muted-foreground">
                We&apos;ve sent a verification link to <strong>{email}</strong>
              </p>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 justify-center mb-2">
                <Timer className="h-4 w-4" />
                <span className="text-sm">Didn&apos;t receive the email?</span>
              </div>
              {countdown > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Resend available in {countdown} seconds
                </p>
              ) : (
                <Button variant="outline" size="sm" onClick={handleResendCode}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend Verification Email
                </Button>
              )}
            </div>
          </div>
        );

      case 2: // Two-Factor Setup
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Smartphone className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Two-Factor Authentication</h3>
              <p className="text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-medium">Authenticator App</h4>
                      <p className="text-sm text-muted-foreground">
                        Use Google Authenticator or similar app
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="twoFactorCode">Enter the 6-digit code</Label>
                    <Input
                      id="twoFactorCode"
                      type="text"
                      placeholder="000000"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <p className="text-sm text-amber-700">
                This step is optional but highly recommended for security
              </p>
            </div>
          </div>
        );

      case 3: // Complete
        return (
          <div className="space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Account Secured!</h3>
              <p className="text-muted-foreground">
                Your account has been set up with enhanced security features
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto mb-2" />
                <div className="font-medium">Strong Password</div>
                <div className="text-muted-foreground">Protected with encryption</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Mail className="h-4 w-4 text-blue-600 mx-auto mb-2" />
                <div className="font-medium">Email Verified</div>
                <div className="text-muted-foreground">Account confirmed</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <Smartphone className="h-4 w-4 text-purple-600 mx-auto mb-2" />
                <div className="font-medium">2FA Enabled</div>
                <div className="text-muted-foreground">Extra protection active</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return email && password && confirmPassword && 
               password === confirmPassword && passwordStrength.score >= 3;
      case 1:
        return true; // Email verification is simulated
      case 2:
        return twoFactorCode.length === 6 || true; // Optional step
      default:
        return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Secure Account Setup
          </CardTitle>
          <CardDescription>
            Follow these steps to create a secure account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {authSteps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${step.status === 'completed' ? 'bg-green-500 text-white' :
                      step.status === 'current' ? 'bg-primary text-primary-foreground' :
                      'bg-muted text-muted-foreground'}
                  `}>
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < authSteps.length - 1 && (
                    <div className={`w-12 h-1 mx-2 ${
                      step.status === 'completed' ? 'bg-green-500' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <h2 className="text-lg font-semibold">{authSteps[currentStep]?.title}</h2>
              <p className="text-sm text-muted-foreground">
                {authSteps[currentStep]?.description}
              </p>
            </div>
          </div>

          {/* Step Content */}
          {renderStepContent()}

          {/* Actions */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0 || isLoading}
            >
              Back
            </Button>
            
            <div className="flex gap-2">
              {currentStep === 2 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(3)}
                  disabled={isLoading}
                >
                  Skip (Not Recommended)
                </Button>
              )}
              
              {currentStep < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    currentStep === 2 ? 'Complete Setup' : 'Continue'
                  )}
                </Button>
              ) : (
                <Button onClick={() => window.location.href = '/dashboard'}>
                  Go to Dashboard
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SecureAuthFlow;
