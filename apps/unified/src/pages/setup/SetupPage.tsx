import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SetupWizard } from '@components/setup-wizard/SetupWizard';
import { useAuthStore } from '@stores/auth';
import { LoadingSpinner } from '@components/common/LoadingSpinner';

export const SetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if setup is already complete
    const checkSetupStatus = async () => {
      try {
        // Check if organization exists and is configured
        const response = await fetch('/api/organization/status');
        if (response.ok) {
          const data = await response.json();
          if (data.isConfigured) {
            setIsSetupComplete(true);
          }
        }
      } catch (error) {
        console.log('Setup status check failed, proceeding with setup');
      } finally {
        setIsLoading(false);
      }
    };

    checkSetupStatus();
  }, []);

  useEffect(() => {
    // If user is authenticated and setup is complete, redirect to dashboard
    if (isAuthenticated && isSetupComplete) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isSetupComplete, navigate]);

  const handleSetupComplete = () => {
    setIsSetupComplete(true);
    // Redirect to login or dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleSetupCancel = () => {
    // Redirect to home or show message
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If setup is already complete, show redirect message
  if (isSetupComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Setup Already Complete
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your organization is already configured. Redirecting...
          </p>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to Nova Universe
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Let's get your IT Service Management platform configured and ready to go
            </p>
          </div>

          <SetupWizard
            onComplete={handleSetupComplete}
            onCancel={handleSetupCancel}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl"
          />
        </div>
      </div>
    </div>
  );
};

export default SetupPage;
